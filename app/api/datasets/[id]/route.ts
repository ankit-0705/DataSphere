import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';
import { isOwnerOrHasRole } from '@/lib/middleware';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        contributor: true,
        tags: { include: { tag: true } },
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    return NextResponse.json(dataset);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json({ error: 'Failed to fetch dataset' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: datasetId } = await params;
  try {
    const user = await verifyFirebaseToken(req);

    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    if (dataset.createdBy !== user.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete related records
    await prisma.comment.deleteMany({ where: { datasetId } });
    await prisma.like.deleteMany({ where: { datasetId } });
    await prisma.datasetTag.deleteMany({ where: { datasetId } });

    // Delete dataset
    await prisma.dataset.delete({ where: { id: datasetId } });

    // Decrement contributions count
    await prisma.user.update({
      where: { id: dataset.createdBy },
      data: { contributions: { decrement: 1 } },
    });

    return NextResponse.json({ message: 'Dataset deleted successfully' });
  } catch (err) {
    console.error('DELETE DATASET ERROR:', err);
    return NextResponse.json({ error: 'Failed to delete dataset' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: datasetId } = await params;
  try {
    const decodedUser = await verifyFirebaseToken(req);
    const {
      title,
      description,
      url,
      category,
      size,
      tags,
    }: {
      title?: string;
      description?: string;
      url?: string;
      category?: string;
      size?: number;
      tags?: string[];
    } = await req.json();

    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
      include: { tags: true },
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    const canEdit = await isOwnerOrHasRole(decodedUser.uid, dataset.createdBy, ['MODERATOR', 'ADMIN']);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Clean tag connections
    if (tags && Array.isArray(tags)) {
      // Remove old tags
      await prisma.dataset.update({
        where: { id: datasetId },
        data: {
          tags: {
            deleteMany: {}, // delete all existing
          },
        },
      });
    }

    // Update dataset
    const updatedDataset = await prisma.dataset.update({
      where: { id: datasetId },
      data: {
        title,
        description,
        url,
        category,
        size,
        ...(tags && {
          tags: {
            create: tags.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })),
          },
        }),
      },
      include: {
        contributor: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ data: updatedDataset });
  } catch (error) {
    console.error('Error updating dataset:', error);
    return NextResponse.json({ error: 'Failed to update dataset' }, { status: 500 });
  }
}
