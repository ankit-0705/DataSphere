import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRole } from '@/lib/middleware';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: datasetId } = await params;

  // Check user role (only MODERATOR and ADMIN allowed)
  const authResult = await verifyRole(req, ['MODERATOR', 'ADMIN']);
  if (authResult instanceof NextResponse) {
    return authResult; // Unauthorized or Forbidden response
  }

  try {
    // Find dataset to verify it exists
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Toggle isVerified flag
    const updatedDataset = await prisma.dataset.update({
      where: { id: datasetId },
      data: { isVerified: !dataset.isVerified },
    });

    return NextResponse.json({
      message: `Dataset is now ${updatedDataset.isVerified ? 'verified' : 'unverified'}`,
      dataset: updatedDataset,
    });
  } catch (error) {
    console.error('Error verifying dataset:', error);
    return NextResponse.json({ error: 'Failed to verify dataset' }, { status: 500 });
  }
}
