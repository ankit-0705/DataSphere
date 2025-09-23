import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let page = parseInt(url.searchParams.get('page') || '1');
    let limit = parseInt(url.searchParams.get('limit') || '10');

    // sanitize page and limit
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 50) limit = 10;

    const skip = (page - 1) * limit;

    // Get total counts
    const totalUsers = await prisma.user.count();
    const totalDatasets = await prisma.dataset.count();

    // Fetch top users with pagination
    const topUsers = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: {
        datasets: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: {
          select: { datasets: true },
        },
      },
    });

    // Fetch top datasets with pagination
    const topDatasets = await prisma.dataset.findMany({
      skip,
      take: limit,
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
      include: {
        contributor: true,
        _count: {
          select: { likes: true },
        },
      },
    });

    // Format users to match frontend expected shape
    const formattedTopUsers = topUsers.map((user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      contributions: user._count.datasets,
    }));

    return NextResponse.json({
      topUsers: formattedTopUsers,
      topDatasets,
      meta: {
        page,
        limit,
        totalUsers,
        totalDatasets,
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
