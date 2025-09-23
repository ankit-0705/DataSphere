import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    const decodedUser = await verifyFirebaseToken(req);
    const userId = decodedUser.uid;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // You can paginate later if needed
    });

    // Map database model fields to frontend expected fields
    const mappedNotifications = notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      content: notif.content,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
    }));

    return NextResponse.json({ notifications: mappedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
