// app/api/datasets/[datasetId]/comments/[commentId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';
import { isOwnerOrHasRole } from '@/lib/middleware';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id: datasetId, commentId } = await params;  // Await params and rename
  try {
    const user = await verifyFirebaseToken(req);

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const canDelete = await isOwnerOrHasRole(user.uid, comment.userId, ['MODERATOR', 'ADMIN']);

    if (!canDelete) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('DELETE COMMENT ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
