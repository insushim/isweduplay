import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface UserProfile {
  id: string
  email: string
  name: string
  image?: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  totalPoints: number
  weeklyPoints: number
  level: number
  experience: number
  streak: number
  maxStreak: number
  gamesPlayed: number
  gamesWon: number
  totalCorrect: number
  totalAnswered: number
}

interface Achievement {
  id: string
  code: string
  name: string
  description: string
  iconUrl?: string
  category: string
  points: number
  rarity: string
  progress: number
  isCompleted: boolean
  unlockedAt?: string
}

interface UserState {
  // User data
  profile: UserProfile | null
  achievements: Achievement[]
  recentGames: RecentGame[]

  // Stats
  weeklyRank: number | null
  levelProgress: number

  // Actions
  setProfile: (profile: UserProfile) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  setAchievements: (achievements: Achievement[]) => void
  addAchievement: (achievement: Achievement) => void
  updateAchievementProgress: (achievementId: string, progress: number) => void
  setRecentGames: (games: RecentGame[]) => void
  addRecentGame: (game: RecentGame) => void
  setWeeklyRank: (rank: number) => void
  addPoints: (points: number) => void
  addExperience: (exp: number) => void
  incrementStreak: () => void
  resetStreak: () => void
  logout: () => void
}

interface RecentGame {
  id: string
  gameType: string
  score: number
  rank: number
  totalPlayers: number
  correctCount: number
  totalQuestions: number
  pointsEarned: number
  expEarned: number
  playedAt: string
}

export const useUserStore = create<UserState>()(
  persist(
    immer((set) => ({
      profile: null,
      achievements: [],
      recentGames: [],
      weeklyRank: null,
      levelProgress: 0,

      setProfile: (profile) =>
        set((state) => {
          state.profile = profile
          state.levelProgress = calculateLevelProgress(profile.experience)
        }),

      updateProfile: (updates) =>
        set((state) => {
          if (state.profile) {
            Object.assign(state.profile, updates)
            if (updates.experience !== undefined) {
              state.levelProgress = calculateLevelProgress(updates.experience)
            }
          }
        }),

      setAchievements: (achievements) =>
        set((state) => {
          state.achievements = achievements
        }),

      addAchievement: (achievement) =>
        set((state) => {
          const exists = state.achievements.find((a) => a.id === achievement.id)
          if (!exists) {
            state.achievements.push(achievement)
          }
        }),

      updateAchievementProgress: (achievementId, progress) =>
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === achievementId)
          if (achievement) {
            achievement.progress = progress
            if (progress >= 100 && !achievement.isCompleted) {
              achievement.isCompleted = true
              achievement.unlockedAt = new Date().toISOString()
            }
          }
        }),

      setRecentGames: (games) =>
        set((state) => {
          state.recentGames = games
        }),

      addRecentGame: (game) =>
        set((state) => {
          state.recentGames.unshift(game)
          if (state.recentGames.length > 20) {
            state.recentGames = state.recentGames.slice(0, 20)
          }
        }),

      setWeeklyRank: (rank) =>
        set((state) => {
          state.weeklyRank = rank
        }),

      addPoints: (points) =>
        set((state) => {
          if (state.profile) {
            state.profile.totalPoints += points
            state.profile.weeklyPoints += points
          }
        }),

      addExperience: (exp) =>
        set((state) => {
          if (state.profile) {
            state.profile.experience += exp
            const { level, progress } = calculateLevel(state.profile.experience)
            state.profile.level = level
            state.levelProgress = progress
          }
        }),

      incrementStreak: () =>
        set((state) => {
          if (state.profile) {
            state.profile.streak += 1
            state.profile.maxStreak = Math.max(
              state.profile.maxStreak,
              state.profile.streak
            )
          }
        }),

      resetStreak: () =>
        set((state) => {
          if (state.profile) {
            state.profile.streak = 0
          }
        }),

      logout: () =>
        set((state) => {
          state.profile = null
          state.achievements = []
          state.recentGames = []
          state.weeklyRank = null
          state.levelProgress = 0
        }),
    })),
    {
      name: 'eduplay-user-storage',
      partialize: (state) => ({
        // Only persist essential data
      }),
    }
  )
)

// Helper functions
function calculateLevelProgress(experience: number): number {
  const { progress } = calculateLevel(experience)
  return progress
}

function calculateLevel(experience: number): { level: number; progress: number } {
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
  const progress = (expInCurrentLevel / currentLevelExp) * 100

  return { level, progress }
}

// Selector hooks
export const useProfile = () => useUserStore((state) => state.profile)
export const useAchievements = () => useUserStore((state) => state.achievements)
export const useRecentGames = () => useUserStore((state) => state.recentGames)
export const useWeeklyRank = () => useUserStore((state) => state.weeklyRank)
