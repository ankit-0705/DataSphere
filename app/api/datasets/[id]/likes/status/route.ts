// app/api/datasets/[id]/likes/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: datasetId } = await params;
  try {
    const user = await verifyFirebaseToken(req);
    const userId = user.uid;

    const like = await prisma.like.findUnique({
      where: {
        userId_datasetId: {
          userId,
          datasetId,
        },
      },
    });

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
  }
}

