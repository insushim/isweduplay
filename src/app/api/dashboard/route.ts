import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({
        user: null,
        stats: null,
        recentGames: [],
        achievements: [],
        quickStats: null
      })
    }

    const userId = session.user.id

    // Get user data with related stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        experience: true,
        totalPoints: true,
        coins: true,
        gamesPlayed: true,
        gamesWon: true,
        streak: true,
        maxStreak: true,
        image: true,
      }
    })

    if (!user) {
      return NextResponse.json({
        user: null,
        stats: null,
        recentGames: [],
        achievements: [],
        quickStats: null
      })
    }

    // Get recent games from GameResult
    const recentGames = await prisma.gameResult.findMany({
      where: { userId },
      include: {
        gameSession: {
          select: {
            gameType: true,
            quizSet: {
              select: {
                title: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get user achievements count
    const achievementsCount = await prisma.userAchievement.count({
      where: { userId }
    })

    // Get total achievements count
    const totalAchievements = await prisma.achievement.count()

    // Calculate next level exp
    const nextLevelExp = Math.floor(100 * user.level * user.level + 50 * user.level)
    const currentLevelStartExp = user.level > 1
      ? Math.floor(100 * (user.level - 1) * (user.level - 1) + 50 * (user.level - 1))
      : 0
    const expProgress = user.experience - currentLevelStartExp
    const expNeeded = nextLevelExp - currentLevelStartExp

    // For teachers, get classroom stats
    let teacherStats = null
    if (user.role === 'TEACHER') {
      const classrooms = await prisma.classroom.findMany({
        where: { ownerId: userId },
        include: {
          _count: { select: { members: true } }
        }
      })

      const quizSets = await prisma.quizSet.count({
        where: { creatorId: userId }
      })

      teacherStats = {
        totalClassrooms: classrooms.length,
        totalStudents: classrooms.reduce((sum, c) => sum + c._count.members, 0),
        totalQuizSets: quizSets
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        exp: user.experience,
        expProgress,
        expNeeded,
        totalScore: user.totalPoints,
        coins: user.coins,
        avatarUrl: user.image,
      },
      stats: {
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        winRate: user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0,
        currentStreak: user.streak,
        maxStreak: user.maxStreak,
        achievementsUnlocked: achievementsCount,
        totalAchievements,
      },
      recentGames: recentGames.map(g => ({
        id: g.id,
        gameType: g.gameSession.gameType,
        title: g.gameSession.quizSet?.title || '게임',
        score: g.totalScore,
        rank: g.finalRank,
        playedAt: g.createdAt.toISOString()
      })),
      teacherStats
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({
      user: null,
      stats: null,
      recentGames: [],
      quickStats: null
    })
  }
}
