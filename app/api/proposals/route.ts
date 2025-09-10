// app/api/processes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { processFormSchema, proposalFormSchema } from '@/lib/forms';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // Extract query parameters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  // Build where conditions
  const whereConditions: any = {
    status: { in: ['active', 'closed'] }
  };

  // Add search filter
  if (search.trim()) {
    whereConditions.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Add category filter - only if category is specified and not 'all'
  if (category.trim() && category !== 'all') {
    whereConditions.category = { equals: category, mode: 'insensitive' };
  }

  const processes = await prisma.process.findMany({
    where: whereConditions,
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(processes);
}

export async function POST(request: NextRequest) {
  console.log('[INFO] Inside POST proposals route');
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawData = await request.json();
    const result = proposalFormSchema.safeParse(rawData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          error: 'Validation failed',
          fieldErrors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      title,
      title_ur,
      description,
      description_ur,
      process_id
    } = result.data;

    console.log("result.data", result.data)

    if (typeof process_id !== 'number') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          fieldErrors: { process_id: ['Process ID is required and must be a number'] },
        },
        { status: 400 }
      );
    }

    const proposal = await prisma.proposal.create({
      data: {
        title,
        title_ur,
        description,
        description_ur,
        process_id,
        author_id: Number(session.user.id),
        status: 'under_review',
      },
    });

    await prisma.participation.create({
      data: {
        user_id: Number(session.user.id),
        process_id: process_id,
        participation_type: 'proposal'
      },
    })

    return NextResponse.json(
      { message: 'Proposal created successfully', proposal: proposal.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Proposal creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', fieldErrors: {} },
      { status: 500 }
    );
  }
}
