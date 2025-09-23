import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify user is authenticated
    await verifyFirebaseToken(req);

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        contributions: true,
        createdAt: true,
        datasets: {
          where: { OR: [{ isVerified: true }, { isVerified: false }] },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            size: true,
            createdAt: true,
            tags: {
              select: {
                tag: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user or unauthorized:', error);
    return NextResponse.json({ error: 'Unauthorized or failed to fetch user' }, { status: 401 });
  }
}
