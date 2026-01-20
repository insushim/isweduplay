import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num)
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분`
  }
  if (minutes > 0) {
    return `${minutes}분 ${seconds % 60}초`
  }
  return `${seconds}초`
}

export function calculateLevel(experience: number): { level: number; progress: number; nextLevelExp: number } {
  // 레벨 당 필요 경험치 (점점 증가)
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

  return { level, progress, nextLevelExp: currentLevelExp }
}

export function calculatePoints(params: {
  basePoints: number
  responseTime: number
  maxTime: number
  streak: number
  difficulty: number
  isCorrect: boolean
}): number {
  if (!params.isCorrect) return 0

  const { basePoints, responseTime, maxTime, streak, difficulty } = params

  // 시간 보너스 (빠를수록 높음)
  const timeRatio = Math.max(0, 1 - responseTime / (maxTime * 1000))
  const timeBonus = Math.floor(basePoints * 0.5 * timeRatio)

  // 연속 정답 보너스
  const streakBonus = Math.min(streak * 10, 100)

  // 난이도 배율
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.2

  const total = Math.floor((basePoints + timeBonus + streakBonus) * difficultyMultiplier)
  return total
}

export function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  if (minutes > 0) return `${minutes}분 전`
  return '방금 전'
}

export function getRankEmoji(rank: number): string {
  switch (rank) {
    case 1: return '🥇'
    case 2: return '🥈'
    case 3: return '🥉'
    default: return `${rank}위`
  }
}

export function getLevelTitle(level: number): string {
  const titles = [
    '새싹 학습자',      // 1-5
    '열정적인 학생',    // 6-10
    '성실한 탐구자',    // 11-15
    '지식의 모험가',    // 16-20
    '학습 챔피언',      // 21-25
    '지혜의 수호자',    // 26-30
    '마스터 학습자',    // 31-40
    '전설의 학자',      // 41-50
    '에듀플레이 영웅',  // 51+
  ]

  if (level <= 5) return titles[0]
  if (level <= 10) return titles[1]
  if (level <= 15) return titles[2]
  if (level <= 20) return titles[3]
  if (level <= 25) return titles[4]
  if (level <= 30) return titles[5]
  if (level <= 40) return titles[6]
  if (level <= 50) return titles[7]
  return titles[8]
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 월요일 시작
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}
