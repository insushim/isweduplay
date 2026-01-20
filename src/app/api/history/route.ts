import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ history: [] })
    }

    const gameResults = await prisma.gameResult.findMany({
      where: { userId: session.user.id },
      include: {
        gameSession: {
          select: {
            gameType: true,
            quizSet: {
              select: { title: true }
            },
            startedAt: true,
            endedAt: true,
            _count: {
              select: { players: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const history = gameResults.map(record => {
      const duration = record.gameSession.startedAt && record.gameSession.endedAt
        ? Math.floor((record.gameSession.endedAt.getTime() - record.gameSession.startedAt.getTime()) / 1000)
        : 0

      return {
        id: record.id,
        gameType: record.gameSession.gameType,
        title: record.gameSession.quizSet?.title || '게임',
        score: record.totalScore,
        rank: record.finalRank,
        totalPlayers: record.gameSession._count.players,
        correctCount: record.correctCount,
        totalQuestions: record.correctCount + record.incorrectCount,
        playedAt: record.createdAt.toISOString(),
        duration
      }
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json({ history: [] })
  }
}
