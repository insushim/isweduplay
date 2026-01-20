import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addPointsSchema = z.object({
  points: z.number().min(1).max(10000),
  reason: z.enum([
    'GAME_WIN',
    'GAME_PARTICIPATION',
    'STREAK_BONUS',
    'ACHIEVEMENT',
    'DAILY_LOGIN',
    'QUIZ_CORRECT',
    'LEVEL_UP',
    'OTHER',
  ]),
  gameSessionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { points, reason, gameSessionId } = addPointsSchema.parse(body)

    // Update user points
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalPoints: { increment: points },
        weeklyPoints: { increment: points },
      },
      select: {
        id: true,
        totalPoints: true,
        weeklyPoints: true,
        level: true,
        experience: true,
      },
    })

    // Check for level up
    const newLevel = calculateLevel(user.experience + points)
    if (newLevel > user.level) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          level: newLevel,
          experience: { increment: points },
        },
      })

      // Award level up achievement
      await checkAndAwardAchievement(session.user.id, 'LEVEL_UP', newLevel)
    } else {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          experience: { increment: points },
        },
      })
    }

    // Check point milestones
    await checkPointMilestones(session.user.id, user.totalPoints + points)

    return NextResponse.json({
      totalPoints: user.totalPoints + points,
      weeklyPoints: user.weeklyPoints + points,
      pointsAdded: points,
      reason,
      levelUp: newLevel > user.level,
      newLevel: newLevel > user.level ? newLevel : undefined,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Add points error:', error)
    return NextResponse.json(
      { error: '포인트 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Get user points
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalPoints: true,
        weeklyPoints: true,
        level: true,
        experience: true,
        streak: true,
        maxStreak: true,
        gamesPlayed: true,
        gamesWon: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    const levelProgress = calculateLevelProgress(user.experience)

    return NextResponse.json({
      ...user,
      levelProgress,
      nextLevelExp: calculateExpForLevel(user.level + 1),
    })
  } catch (error) {
    console.error('Get points error:', error)
    return NextResponse.json(
      { error: '포인트 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateLevel(experience: number): number {
  const baseExp = 100
  const multiplier = 1.5
  let level = 1
  let totalExp = 0
  let currentLevelExp = baseExp

  while (experience >= totalExp + currentLevelExp) {
    totalExp += currentLevelExp
    level++
    currentLevelExp = Math.floor(baseExp * Math.pow(multiplier, level - 1))
  }

  return level
}

function calculateExpForLevel(level: number): number {
  const baseExp = 100
  const multiplier = 1.5
  return Math.floor(baseExp * Math.pow(multiplier, level - 1))
}

function calculateLevelProgress(experience: number): number {
  const baseExp = 100
  const multiplier = 1.5
  let level = 1
  let totalExp = 0
  let currentLevelExp = baseExp

  while (experience >= totalExp + currentLevelExp) {
    totalExp += currentLevelExp
    level++
    currentLevelExp = Math.floor(baseExp * Math.pow(multiplier, level - 1))
  }

  const expInCurrentLevel = experience - totalExp
  return (expInCurrentLevel / currentLevelExp) * 100
}

async function checkAndAwardAchievement(
  userId: string,
  achievementCode: string,
  progress: number
) {
  const achievement = await prisma.achievement.findFirst({
    where: { code: achievementCode },
  })

  if (!achievement) return

  const existing = await prisma.userAchievement.findFirst({
    where: {
      userId,
      achievementId: achievement.id,
    },
  })

  if (existing?.isCompleted) return

  if (existing) {
    await prisma.userAchievement.update({
      where: { id: existing.id },
      data: {
        progress: Math.min(100, progress),
        isCompleted: progress >= 100,
        unlockedAt: progress >= 100 ? new Date() : undefined,
      },
    })
  } else {
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        progress: Math.min(100, progress),
        isCompleted: progress >= 100,
        unlockedAt: progress >= 100 ? new Date() : undefined,
      },
    })
  }
}

async function checkPointMilestones(userId: string, totalPoints: number) {
  const milestones = [
    { code: 'POINTS_100', threshold: 100 },
    { code: 'POINTS_500', threshold: 500 },
    { code: 'POINTS_1000', threshold: 1000 },
    { code: 'POINTS_5000', threshold: 5000 },
    { code: 'POINTS_10000', threshold: 10000 },
  ]

  for (const milestone of milestones) {
    if (totalPoints >= milestone.threshold) {
      await checkAndAwardAchievement(userId, milestone.code, 100)
    }
  }
}
