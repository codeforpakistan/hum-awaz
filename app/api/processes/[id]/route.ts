// app/api/processes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { processFormSchema } from '@/lib/forms';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // params is now a Promise
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Await the params first
  const params = await context.params;
    const id = params.id;

  console.log('[INFO] Fetching process with ID:', id);

  // Convert id to number since your schema uses Int for user IDs
  const processId = Number(id);

  if (isNaN(processId)) {
    return NextResponse.json({ error: 'Invalid process ID' }, { status: 400 });
  }

  const process = await prisma.process.findUnique({
    where: { id: processId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      discussions: true,
      proposals: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          discussions: true,
          votes: {
            where: {
              user_id: Number(session.user.id) // This filters the votes relation for each proposal
            },
            select: {
              vote_type: true,   // This is the crucial part: 'SUPPORT', 'OPPOSE', 'NEUTRAL'
            }
          },
        },
      },
    },
  });

  if (!process) {
    return NextResponse.json({ error: 'Process not found' }, { status: 404 });
  }

  const proposalsWithVoteCounts = await Promise.all(
    process.proposals.map(async (proposal) => {
      const supportCount = await prisma.vote.count({
        where: { proposal_id: proposal.id, vote_type: 'support' }
      });
      const opposeCount = await prisma.vote.count({
        where: { proposal_id: proposal.id, vote_type: 'oppose' }
      });
      const neutralCount = await prisma.vote.count({
        where: { proposal_id: proposal.id, vote_type: 'neutral' }
      });
      return {
        ...proposal,
        voteCounts: {
          support: supportCount,
          oppose: opposeCount,
          neutral: neutralCount
        }
      };
    })
  );

  const result = {
    ...process,
    proposals: proposalsWithVoteCounts
  };

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  console.log('[INFO] Inside POST process route');
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawData = await request.json();
    const result = processFormSchema.safeParse(rawData);

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
      category,
      organization,
      end_date,
    } = result.data;

    console.log("result.data", result.data)

    const process = await prisma.process.create({
      data: {
        title,
        title_ur,
        description,
        description_ur,
        category,
        organization,
        end_date: new Date(end_date),
        created_by: Number(session.user.id),
      },
    });

    return NextResponse.json(
      { message: 'Process created successfully', process: process.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Process creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', fieldErrors: {} },
      { status: 500 }
    );
  }
}
