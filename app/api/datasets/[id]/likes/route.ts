import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: datasetId } = await params;
  try {
    const decodedUser = await verifyFirebaseToken(req);
    const userId = decodedUser.uid;

    // Check if user already liked this dataset
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_datasetId: {
          userId,
          datasetId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      const likeCount = await prisma.like.count({ where: { datasetId } });

      return NextResponse.json({ liked: false, likeCount });
    } else {
      const newLike = await prisma.like.create({
        data: {
          userId,
          datasetId,
        },
        include: {
          user: true,
        },
      });

      const dataset = await prisma.dataset.findUnique({
        where: { id: datasetId },
        include: { contributor: true },
      });

      if (dataset && dataset.createdBy !== userId) {
        await prisma.notification.create({
          data: {
            userId: dataset.createdBy,
            type: 'like',
            refId: newLike.id,
            content: `${newLike.user.name} liked your dataset "${dataset.title}"`,
            isRead: false,
          },
        });
      }

      const likeCount = await prisma.like.count({ where: { datasetId } });

      return NextResponse.json({ liked: true, likeCount });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: datasetId } = await params;
  try {
    const decodedUser = await verifyFirebaseToken(req);
    const userId = decodedUser.uid;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_datasetId: { userId, datasetId },
      },
    });

    if (!existingLike) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 });
    }

    await prisma.like.delete({ where: { id: existingLike.id } });

    return NextResponse.json({ liked: false });
  } catch (error) {
    console.error('Error deleting like:', error);
    return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 401 });
  }
}
