import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';

// Utility function to format the response into { month: 'YYYY-MM', count: number }
function formatMonthlyResults(data: { month: string; count: bigint }[]) {
  return data.map((item) => ({
    month: item.month,
    count: Number(item.count),
  }));
}

export async function GET(req: NextRequest) {
  try {
     await verifyFirebaseToken(req);

    // Optional role-based access
    // if (decodedUser.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const [datasetStats, likeStats, commentStats] = await Promise.all([
      prisma.$queryRaw<
        { month: string; count: bigint }[]
      >`SELECT TO_CHAR("createdAt", 'YYYY-MM') AS month, COUNT(*)::bigint AS count FROM "Dataset" GROUP BY month ORDER BY month`,

      prisma.$queryRaw<
        { month: string; count: bigint }[]
      >`SELECT TO_CHAR("createdAt", 'YYYY-MM') AS month, COUNT(*)::bigint AS count FROM "Like" GROUP BY month ORDER BY month`,

      prisma.$queryRaw<
        { month: string; count: bigint }[]
      >`SELECT TO_CHAR("createdAt", 'YYYY-MM') AS month, COUNT(*)::bigint AS count FROM "Comment" GROUP BY month ORDER BY month`,
    ]);

    return NextResponse.json({
      datasetsPerMonth: formatMonthlyResults(datasetStats),
      likesPerMonth: formatMonthlyResults(likeStats),
      commentsPerMonth: formatMonthlyResults(commentStats),
    });
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return NextResponse.json({ error: 'Try with correct token' }, { status: 401 });
  }
}
