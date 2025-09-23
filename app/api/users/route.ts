import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

export async function GET(req: NextRequest) {
  try {
    // Verify token and get user info - if invalid, throws
    await verifyFirebaseToken(req);

    const { searchParams } = new URL(req.url);

    let limit = Number(searchParams.get('limit'));
    let offset = Number(searchParams.get('offset'));

    if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
    else if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    if (isNaN(offset) || offset < 0) offset = DEFAULT_OFFSET;

    // Optional: Get total count for pagination
    const total = await prisma.user.count();

    const users = await prisma.user.findMany({
      skip: offset,
      take: limit,
      orderBy: { contributions: 'desc' },
      select: {
        id: true,
        name: true,
        avatar: true,
        contributions: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { data: users, total, limit, offset },
      { headers: { 'Cache-Control': 'public, max-age=60' } } // cache 1 min
    );
  } catch (error) {
    console.error('Error fetching users list or unauthorized:', error);
    return NextResponse.json({ error: 'Unauthorized or invalid token' }, { status: 401 });
  }
}
