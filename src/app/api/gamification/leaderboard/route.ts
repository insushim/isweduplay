import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get('type') || 'weekly' // weekly, allTime, monthly
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100)
    const classroomId = searchParams.get('classroomId')

    let orderBy: { totalPoints?: 'desc'; weeklyPoints?: 'desc' } = {}

    // Determine sort field based on type
    if (type === 'weekly') {
      orderBy = { weeklyPoints: 'desc' }
    } else {
      orderBy = { totalPoints: 'desc' }
    }

    // Build where clause
    const whereClause = classroomId
      ? {
          enrollments: {
            some: { classroomId },
          },
        }
      : {}

    // Get leaderboard
    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy,
      take: limit,
      select: {
        id: true,
        name: true,
        image: true,
        totalPoints: true,
        weeklyPoints: true,
        level: true,
        streak: true,
        gamesPlayed: true,
        gamesWon: true,
      },
    })

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name,
      image: user.image,
      points: type === 'weekly' ? user.weeklyPoints : user.totalPoints,
      level: user.level,
      streak: user.streak,
      gamesPlayed: user.gamesPlayed,
      winRate:
        user.gamesPlayed > 0
          ? Math.round((user.gamesWon / user.gamesPlayed) * 100)
          : 0,
    }))

    // Get current user's rank if logged in
    let myRank = null
    if (session?.user) {
      const myIndex = leaderboard.findIndex((u) => u.userId === session.user.id)
      if (myIndex !== -1) {
        myRank = myIndex + 1
      } else {
        // User not in top results, calculate their actual rank
        const pointsField = type === 'weekly' ? 'weeklyPoints' : 'totalPoints'
        const myUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { weeklyPoints: true, totalPoints: true },
        })

        if (myUser) {
          const myPoints = pointsField === 'weeklyPoints' ? myUser.weeklyPoints : myUser.totalPoints
          const higherCount = await prisma.user.count({
            where: {
              ...whereClause,
              [pointsField]: { gt: myPoints },
            },
          })
          myRank = higherCount + 1
        }
      }
    }

    // Get total count
    const totalUsers = await prisma.user.count({ where: whereClause })

    return NextResponse.json({
      leaderboard,
      myRank,
      totalUsers,
      type,
      classroomId,
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: '리더보드 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Reset weekly points (should be called by cron job)
export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (e.g., from cron job)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'reset_weekly') {
      // Archive current weekly rankings
      const topUsers = await prisma.user.findMany({
        orderBy: { weeklyPoints: 'desc' },
        take: 100,
        select: {
          id: true,
          weeklyPoints: true,
        },
      })

      // Create weekly ranking records
      const weekStart = getWeekStart(new Date())
      const weekEnd = getWeekEnd(new Date())
      for (let i = 0; i < topUsers.length; i++) {
        await prisma.weeklyRanking.upsert({
          where: {
            userId_weekStart: {
              userId: topUsers[i].id,
              weekStart,
            },
          },
          update: {
            rank: i + 1,
            points: topUsers[i].weeklyPoints,
          },
          create: {
            userId: topUsers[i].id,
            weekStart,
            weekEnd,
            rank: i + 1,
            points: topUsers[i].weeklyPoints,
          },
        })
      }

      // Reset weekly points for all users
      await prisma.user.updateMany({
        data: { weeklyPoints: 0 },
      })

      return NextResponse.json({
        message: 'Weekly leaderboard reset completed',
        archivedCount: topUsers.length,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Leaderboard reset error:', error)
    return NextResponse.json(
      { error: '리더보드 리셋 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekEnd(date: Date): Date {
  const d = getWeekStart(date)
  d.setDate(d.getDate() + 6) // Sunday
  d.setHours(23, 59, 59, 999)
  return d
}
