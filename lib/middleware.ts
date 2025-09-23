import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebase/server';
import { prisma } from './prisma';

// ✅ Role-based access verification
export async function verifyRole(
  req: NextRequest,
  roles: ('USER' | 'MODERATOR' | 'ADMIN')[]
) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    if (!roles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    return { user };
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
}

// ✅ Ownership or elevated role check
export async function isOwnerOrHasRole(
  uid: string,
  ownerId: string,
  roles: ('USER' | 'MODERATOR' | 'ADMIN')[]
): Promise<boolean> {
  if (uid === ownerId) return true;

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { role: true },
  });

  return !!user && roles.includes(user.role);
}
