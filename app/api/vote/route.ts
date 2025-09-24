// app/api/processes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { processFormSchema } from '@/lib/forms';

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
    include: {
      proposals: {
        include: {
          discussions: true,
        }
      }
    }
  });

  return NextResponse.json(processes);
}

export async function POST(request: NextRequest) {
  console.log('[INFO] Inside POST process route');
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawData = await request.json();

    const {
      proposalId,
      voteType,
    } = rawData;

    const existingVote = await prisma.vote.findFirst({
      where: {
        user_id: Number(session.user.id),
        proposal_id: proposalId,
      },
    });

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted on this proposal.' }, { status: 400 });
    }

    const vote = await prisma.vote.create({
      data: {
        user: {
          connect: { id: Number(session.user.id) }
        },
        proposal: {
          connect: { id: proposalId }
        },
        vote_type: voteType
      },
      include: {
        proposal: {
            select: {
                process_id: true // Include the process_id from the proposal
            }
            }
        }
    });

    await prisma.participation.upsert({
      where: {
          user_id_process_id_participation_type: {
          user_id: Number(session.user.id),
          process_id: vote.proposal.process_id,
          participation_type: 'vote',
          },
      },
      update: {},
      create: {
          user: {
          connect: { id: Number(session.user.id) }
          },
          process: {
          connect: { id: vote.proposal.process_id }
          },
          participation_type: 'vote',
      },
    });

    return NextResponse.json(
      { message: 'Vote cast successfully', vote: vote.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Vote cast error:', error);
    return NextResponse.json(
      { error: 'Internal server error', fieldErrors: {} },
      { status: 500 }
    );
  }
}
