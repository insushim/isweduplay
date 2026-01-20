import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AchievementCategory } from '@prisma/client'

// Get user achievements
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as AchievementCategory | null
    const completed = searchParams.get('completed')

    // Get all achievements
    const achievements = await prisma.achievement.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { points: 'desc' }],
    })

    // Get user's progress
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
    })

    const userAchievementMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua])
    )

    // Combine achievements with user progress
    let result = achievements.map((achievement) => {
      const userProgress = userAchievementMap.get(achievement.id)
      return {
        id: achievement.id,
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        iconUrl: achievement.iconUrl,
        category: achievement.category,
        points: achievement.points,
        rarity: achievement.rarity,
        progress: userProgress?.progress || 0,
        isCompleted: userProgress?.isCompleted || false,
        unlockedAt: userProgress?.unlockedAt || null,
      }
    })

    // Filter by completion status if requested
    if (completed === 'true') {
      result = result.filter((a) => a.isCompleted)
    } else if (completed === 'false') {
      result = result.filter((a) => !a.isCompleted)
    }

    // Group by category
    const grouped = result.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = []
      }
      acc[achievement.category].push(achievement)
      return acc
    }, {} as Record<string, typeof result>)

    // Calculate stats
    const totalAchievements = achievements.length
    const completedAchievements = result.filter((a) => a.isCompleted).length
    const totalPoints = result
      .filter((a) => a.isCompleted)
      .reduce((sum, a) => sum + a.points, 0)

    return NextResponse.json({
      achievements: result,
      grouped,
      stats: {
        total: totalAchievements,
        completed: completedAchievements,
        totalPoints,
        completionRate: Math.round(
          (completedAchievements / totalAchievements) * 100
        ),
      },
    })
  } catch (error) {
    console.error('Get achievements error:', error)
    return NextResponse.json(
      { error: '업적 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Check and update achievement progress
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { achievementCode, progress, incrementBy } = body

    if (!achievementCode) {
      return NextResponse.json(
        { error: '업적 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    const achievement = await prisma.achievement.findFirst({
      where: { code: achievementCode },
    })

    if (!achievement) {
      return NextResponse.json(
        { error: '업적을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Get current progress
    const existingProgress = await prisma.userAchievement.findFirst({
      where: {
        userId: session.user.id,
        achievementId: achievement.id,
      },
    })

    // If already completed, skip
    if (existingProgress?.isCompleted) {
      return NextResponse.json({
        message: '이미 달성한 업적입니다.',
        achievement: {
          ...achievement,
          progress: 100,
          isCompleted: true,
          unlockedAt: existingProgress.unlockedAt,
        },
      })
    }

    // Calculate new progress
    let newProgress = progress
    if (incrementBy) {
      newProgress = (existingProgress?.progress || 0) + incrementBy
    }
    newProgress = Math.min(100, newProgress)

    const isCompleted = newProgress >= 100
    const unlockedAt = isCompleted ? new Date() : null

    // Update or create progress
    const userAchievement = await prisma.userAchievement.upsert({
      where: {
        id: existingProgress?.id || 'new',
      },
      update: {
        progress: newProgress,
        isCompleted,
        unlockedAt: isCompleted ? unlockedAt : undefined,
      },
      create: {
        userId: session.user.id,
        achievementId: achievement.id,
        progress: newProgress,
        isCompleted,
        unlockedAt,
      },
    })

    // If just completed, add achievement points to user
    if (isCompleted && !existingProgress?.isCompleted) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalPoints: { increment: achievement.points },
          weeklyPoints: { increment: achievement.points },
        },
      })
    }

    return NextResponse.json({
      achievement: {
        ...achievement,
        progress: userAchievement.progress,
        isCompleted: userAchievement.isCompleted,
        unlockedAt: userAchievement.unlockedAt,
      },
      justUnlocked: isCompleted && !existingProgress?.isCompleted,
      pointsEarned: isCompleted ? achievement.points : 0,
    })
  } catch (error) {
    console.error('Update achievement error:', error)
    return NextResponse.json(
      { error: '업적 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
