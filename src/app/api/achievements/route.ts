import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  // Game achievements
  { id: 'first_game', name: '첫 게임', description: '첫 게임을 플레이하세요', icon: '🎮', category: '게임', maxProgress: 1, reward: { type: 'coins', amount: 100 } },
  { id: 'games_10', name: '게임 마스터', description: '10개의 게임을 플레이하세요', icon: '🎯', category: '게임', maxProgress: 10, reward: { type: 'coins', amount: 500 } },
  { id: 'games_50', name: '게임 전문가', description: '50개의 게임을 플레이하세요', icon: '⭐', category: '게임', maxProgress: 50, reward: { type: 'coins', amount: 1000 } },
  { id: 'games_100', name: '게임 레전드', description: '100개의 게임을 플레이하세요', icon: '🏆', category: '게임', maxProgress: 100, reward: { type: 'coins', amount: 2000 } },

  // Win achievements
  { id: 'first_win', name: '첫 승리', description: '첫 1등을 하세요', icon: '🥇', category: '승리', maxProgress: 1, reward: { type: 'coins', amount: 200 } },
  { id: 'wins_10', name: '승리의 맛', description: '10번 1등을 하세요', icon: '🏅', category: '승리', maxProgress: 10, reward: { type: 'coins', amount: 1000 } },
  { id: 'wins_50', name: '연승 마스터', description: '50번 1등을 하세요', icon: '👑', category: '승리', maxProgress: 50, reward: { type: 'coins', amount: 3000 } },

  // Score achievements
  { id: 'score_1000', name: '점수 수집가', description: '총 1,000점 달성', icon: '💯', category: '점수', maxProgress: 1000, reward: { type: 'coins', amount: 300 } },
  { id: 'score_10000', name: '점수 왕', description: '총 10,000점 달성', icon: '💎', category: '점수', maxProgress: 10000, reward: { type: 'coins', amount: 1500 } },
  { id: 'score_100000', name: '점수 황제', description: '총 100,000점 달성', icon: '🌟', category: '점수', maxProgress: 100000, reward: { type: 'coins', amount: 5000 } },

  // Streak achievements
  { id: 'streak_5', name: '연속 정답', description: '5문제 연속 정답', icon: '🔥', category: '연속', maxProgress: 5, reward: { type: 'coins', amount: 200 } },
  { id: 'streak_10', name: '불타는 연속', description: '10문제 연속 정답', icon: '💥', category: '연속', maxProgress: 10, reward: { type: 'coins', amount: 500 } },
  { id: 'streak_20', name: '전설의 연속', description: '20문제 연속 정답', icon: '🌈', category: '연속', maxProgress: 20, reward: { type: 'coins', amount: 1000 } },

  // Level achievements
  { id: 'level_5', name: '레벨 5', description: '레벨 5 달성', icon: '📈', category: '레벨', maxProgress: 5, reward: { type: 'coins', amount: 300 } },
  { id: 'level_10', name: '레벨 10', description: '레벨 10 달성', icon: '📊', category: '레벨', maxProgress: 10, reward: { type: 'coins', amount: 1000 } },
  { id: 'level_25', name: '레벨 25', description: '레벨 25 달성', icon: '🚀', category: '레벨', maxProgress: 25, reward: { type: 'coins', amount: 3000 } },
]

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      // Return default achievements for non-logged in users
      return NextResponse.json({
        achievements: ACHIEVEMENT_DEFINITIONS.map(def => ({
          ...def,
          progress: 0,
          unlocked: false,
        }))
      })
    }

    const userId = session.user.id

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        totalPoints: true,
        gamesPlayed: true,
        gamesWon: true,
        maxStreak: true,
      }
    })

    // Get user achievements from database
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true }
    })

    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievement.code, ua.unlockedAt])
    )

    // Calculate progress for each achievement
    const achievements = ACHIEVEMENT_DEFINITIONS.map(def => {
      let progress = 0

      if (user) {
        switch (def.id) {
          case 'first_game':
          case 'games_10':
          case 'games_50':
          case 'games_100':
            progress = Math.min(user.gamesPlayed, def.maxProgress)
            break
          case 'first_win':
          case 'wins_10':
          case 'wins_50':
            progress = Math.min(user.gamesWon, def.maxProgress)
            break
          case 'score_1000':
          case 'score_10000':
          case 'score_100000':
            progress = Math.min(user.totalPoints, def.maxProgress)
            break
          case 'streak_5':
          case 'streak_10':
          case 'streak_20':
            progress = Math.min(user.maxStreak, def.maxProgress)
            break
          case 'level_5':
          case 'level_10':
          case 'level_25':
            progress = Math.min(user.level, def.maxProgress)
            break
        }
      }

      const unlockedAt = unlockedMap.get(def.id)
      const unlocked = progress >= def.maxProgress

      return {
        ...def,
        progress,
        unlocked,
        unlockedAt: unlockedAt?.toISOString() || null,
      }
    })

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Achievements API error:', error)
    return NextResponse.json({
      achievements: ACHIEVEMENT_DEFINITIONS.map(def => ({
        ...def,
        progress: 0,
        unlocked: false,
      }))
    })
  }
}
