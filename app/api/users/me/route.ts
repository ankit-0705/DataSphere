import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';

const URL_REGEX = /^(https?:\/\/)([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/i;

export async function GET(req: NextRequest) {
  try {
    const decodedUser = await verifyFirebaseToken(req);

    const user = await prisma.user.findUnique({
      where: { id: decodedUser.uid },
      include: {
        datasets: true,
        comments: true,
        likes: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Count how many users have more contributions than this user
    const usersAbove = await prisma.user.count({
      where: {
        contributions: {
          gt: user.contributions,
        },
      },
    });

    const rank = usersAbove + 1;

    let tier = '';
    if (rank <=3) tier = 'Top 3 Contributor';
    else if (rank <= 10) tier = 'Top 10 Contributor';
    else if (rank <= 50) tier = 'Top 50 Contributor';
    else if (rank <= 100) tier = 'Top 100 Contributor';
    else if (rank <= 500) tier = 'Top 100+ Contributor';
    else tier = 'Top 500+ Contributor';

    return NextResponse.json({
      data: user,
      leaderboard: {
        rank,
        tier,
      },
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Unauthorized or invalid token' }, { status: 401 });
  }
}


export async function PATCH(req: NextRequest) {
  try {
    const decodedUser = await verifyFirebaseToken(req);
    const { name, avatar } = await req.json();

    if (!name && !avatar) {
      return NextResponse.json(
        { error: 'Nothing to update. Provide name and/or avatar.' },
        { status: 400 }
      );
    }

    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      return NextResponse.json(
        { error: 'Invalid name. Must be at least 2 characters.' },
        { status: 400 }
      );
    }

    if (avatar && (typeof avatar !== 'string' || !URL_REGEX.test(avatar))) {
      return NextResponse.json(
        { error: 'Invalid avatar URL.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: decodedUser.uid },
      data: {
        ...(name && { name: name.trim() }),
        ...(avatar && { avatar }),
      },
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const decodedUser = await verifyFirebaseToken(req);

    await prisma.$transaction([
      prisma.like.deleteMany({ where: { userId: decodedUser.uid } }),
      prisma.comment.deleteMany({ where: { userId: decodedUser.uid } }),
      prisma.dataset.deleteMany({ where: { createdBy: decodedUser.uid } }),
      prisma.user.delete({ where: { id: decodedUser.uid } }),
    ]);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
