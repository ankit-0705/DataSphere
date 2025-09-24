import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: datasetId } = await params;
  try {
    await verifyFirebaseToken(req); // Require login to view comments

    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: { datasetId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.comment.count({ where: { datasetId } });

    return NextResponse.json({ comments, total, page, limit });
  } catch (error: unknown) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: datasetId } = await params;
  try {
    const decodedUser = await verifyFirebaseToken(req);
    const userId = decodedUser.uid;

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid comment text' }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: {
        text,
        userId,
        datasetId,
      },
      include: { user: true },
    });

    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
      include: { contributor: true },
    });

    if (dataset && dataset.createdBy !== userId) {
      await prisma.notification.create({
        data: {
          userId: dataset.createdBy,
          type: 'comment',
          refId: newComment.id,
          content: `${newComment.user.name} commented on your dataset "${dataset.title}"`,
          isRead: false,
        },
      });
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: unknown) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

