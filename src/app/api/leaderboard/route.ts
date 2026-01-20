import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'weekly'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      default:
        startDate = new Date(0) // All time
    }

    // Get leaderboard data
    const users = await prisma.user.findMany({
      where: {
        gameResults: period !== 'all' ? {
          some: {
            createdAt: { gte: startDate }
          }
        } : undefined
      },
      select: {
        id: true,
        name: true,
        image: true,
        level: true,
        totalPoints: true,
        gamesPlayed: true,
        gamesWon: true,
      },
      orderBy: {
        totalPoints: 'desc'
      },
      take: 100
    })

    const leaderboard = users.map((user, index) => ({
      id: user.id,
      name: user.name || 'Unknown',
      avatar: user.image,
      totalScore: user.totalPoints,
      gamesPlayed: user.gamesPlayed,
      winRate: user.gamesPlayed > 0
        ? Math.round((user.gamesWon / user.gamesPlayed) * 100)
        : 0,
      level: user.level,
      rank: index + 1
    }))

    // Find current user's rank
    let myRank = null
    if (session?.user?.id) {
      const userIndex = leaderboard.findIndex(u => u.id === session.user.id)
      if (userIndex !== -1) {
        myRank = userIndex + 1
      }
    }

    return NextResponse.json({ leaderboard, myRank })
  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json({ leaderboard: [], myRank: null })
  }
}
