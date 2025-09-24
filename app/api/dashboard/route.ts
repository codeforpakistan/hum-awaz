// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }


  const processes = prisma.process.findMany({
    where: { status: "active" },
    orderBy: { created_at: 'desc' },
    take: 5,
  })

  const proposals = prisma.proposal.findMany({
    where: { author_id: Number(session.user.id) },
    orderBy: { created_at: 'desc' },
  })

  const totalProcesses = await prisma.process.count()
  const totalActiveProcesses = await prisma.process.count({ where: { status: "active" } })
  const totalProposals = await prisma.proposal.count()
  const totalVotes = await prisma.vote.count()

  return NextResponse.json({
    processes: await processes,
    proposals: await proposals,
    totalProcesses: totalProcesses || 0,
    totalActiveProcesses: totalActiveProcesses || 0,
    totalProposals: totalProposals || 0,
    totalVotes: totalVotes || 0,
  })
}
