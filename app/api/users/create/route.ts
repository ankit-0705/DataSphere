// /app/api/users/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const decodedUser = await verifyFirebaseToken(req);
    const { name, avatar } = await req.json();

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name is required and must be at least 2 characters.' },
        { status: 400 }
      );
    }

    // Validate email
    if (!decodedUser.email || typeof decodedUser.email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required but missing from Firebase token.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: decodedUser.uid },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists.' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        id: decodedUser.uid,
        name: name.trim(),
        email: decodedUser.email,
        avatar: avatar?.trim() || null,
      },
    });

    return NextResponse.json({ data: newUser }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
