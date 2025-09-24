import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/auth/server';
import { Prisma } from '@prisma/client'; // Import generated Prisma types

function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function isGoogleDriveURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['drive.google.com', 'docs.google.com'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

interface DatasetCreateBody {
  title: string;
  description?: string;
  url: string;
  category?: string;
  size?: number;
  tags?: string[];
}

export async function POST(req: NextRequest) {
  try {
    // Require login
    const decodedUser = await verifyFirebaseToken(req);

    const body: DatasetCreateBody = await req.json();
    const { title, url, description, category, size, tags } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    if (!isValidURL(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (!isGoogleDriveURL(url)) {
      return NextResponse.json(
        { error: 'Only Google Drive links are allowed (drive.google.com or docs.google.com)' },
        { status: 400 }
      );
    }

    if (tags && !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags must be an array of strings' }, { status: 400 });
    }

    // Create dataset with tags
    const dataset = await prisma.dataset.create({
      data: {
        title,
        description,
        url,
        category,
        size,
        createdBy: decodedUser.uid,
        tags: {
          create: (tags || []).map((tagName) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    // Increment user contributions
    await prisma.user.update({
      where: { id: decodedUser.uid },
      data: { contributions: { increment: 1 } },
    });

    return NextResponse.json({ data: dataset }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating dataset:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: string }).message === 'string'
    ) {
      const message = (error as { message: string }).message;
      if (message.includes('Firebase') || message.includes('token')) {
        return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 401 });
      }
    }
    return NextResponse.json({ error: 'Failed to create dataset' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Require login
    await verifyFirebaseToken(req);

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const minSize = parseInt(searchParams.get('minSize') || '');
    const maxSize = parseInt(searchParams.get('maxSize') || '');

    const orderByLikes = searchParams.get('orderByLikes') === 'true';
    const orderByComments = searchParams.get('orderByComments') === 'true';
    const verifiedOnly = searchParams.get('verified') === 'true';
    const orderByDate = searchParams.get('orderByDate') === 'true';

    let page = parseInt(searchParams.get('page') || '1');
    let limit = parseInt(searchParams.get('limit') || '20');

    // Sanitize pagination params
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;

    // Build where clause
    const andConditions: Prisma.DatasetWhereInput[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (category) andConditions.push({ category });
    if (tag) andConditions.push({ tags: { some: { tag: { name: tag } } } });
    if (!isNaN(minSize)) andConditions.push({ size: { gte: minSize } });
    if (!isNaN(maxSize)) andConditions.push({ size: { lte: maxSize } });
    if (verifiedOnly) andConditions.push({ isVerified: true });

    const whereClause: Prisma.DatasetWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    // Dynamic orderBy logic (priority: Likes > Comments > Date)
    const orderBy: Prisma.DatasetOrderByWithRelationInput[] = [];

    if (orderByLikes) {
      orderBy.push({ likes: { _count: 'desc' } });
    }

    if (orderByComments) {
      orderBy.push({ comments: { _count: 'desc' } });
    }

    if (orderByDate || (!orderByLikes && !orderByComments)) {
      orderBy.push({ createdAt: 'desc' });
    }

    // Query datasets
    const datasets = await prisma.dataset.findMany({
      where: whereClause,
      include: {
        tags: { include: { tag: true } },
        contributor: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    const total = await prisma.dataset.count({ where: whereClause });

    return NextResponse.json({
      data: datasets,
      meta: { total, page, limit },
    });
  } catch (error: unknown) {
    console.error('Error fetching datasets:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: string }).message === 'string'
    ) {
      const message = (error as { message: string }).message;
      if (message.includes('Firebase') || message.includes('token')) {
        return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 401 });
      }
    }

    return NextResponse.json({ error: 'Failed to fetch datasets' }, { status: 500 });
  }
}
