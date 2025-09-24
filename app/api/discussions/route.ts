// app/api/processes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { discussionFormSchema, processFormSchema } from '@/lib/forms';

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
    status: { in: ['active', 'closed'] },
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
    include: {
      proposals: {
        include: {
          discussions: true,
        },
      },
    },
  });

  return NextResponse.json(processes);
}

export async function POST(request: NextRequest) {
  console.log('[INFO] Inside POST discussion route');
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawData = await request.json();
    const result = discussionFormSchema.safeParse(rawData);

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

    const { comment, proposal_id, process_id } = result.data;

    const discussion = await prisma.discussion.create({
      data: {
        content: comment,
        proposal: proposal_id
          ? {
              connect: { id: proposal_id },
            }
          : undefined,
        process: process_id
          ? {
              connect: { id: process_id },
            }
          : undefined,
        author: {
          connect: { id: Number(session.user.id) },
        },
      },
    });

    return NextResponse.json(
      { message: 'Discussion submitted successfully', discussion: discussion.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Discussion submitted error:', error);
    return NextResponse.json(
      { error: 'Internal server error', fieldErrors: {} },
      { status: 500 }
    );
  }
}
