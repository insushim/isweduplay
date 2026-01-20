'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { GAME_MODE_CONFIG, type GameType } from '@/types/game'

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
    level: number
    exp: number
    expProgress: number
    expNeeded: number
    totalScore: number
    coins: number
    avatarUrl?: string
  } | null
  stats: {
    gamesPlayed: number
    gamesWon: number
    winRate: number
    currentStreak: number
    maxStreak: number
    achievementsUnlocked: number
    totalAchievements: number
  } | null
  recentGames: {
    id: string
    gameType: GameType
    title: string
    score: number
    rank: number
    playedAt: string
  }[]
  teacherStats?: {
    totalClassrooms: number
    totalStudents: number
    totalQuizSets: number
  } | null
}

// Level title based on level
function getLevelTitle(level: number) {
  const titles = [
    '새내기',
    '학습자',
    '탐험가',
    '연구원',
    '학자',
    '전문가',
    '마스터',
    '그랜드마스터',
    '현자',
    '전설',
  ]
  return titles[Math.min(Math.floor(level / 5), titles.length - 1)]
}

// Format relative time
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return date.toLocaleDateString('ko-KR')
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const user = dashboardData?.user
  const stats = dashboardData?.stats
  const recentGames = dashboardData?.recentGames || []
  const teacherStats = dashboardData?.teacherStats
  const levelTitle = getLevelTitle(user?.level ?? 1)

  // Game modes for quick access
  const featuredGames: GameType[] = ['QUIZ_BATTLE', 'SPEED_RACE', 'SURVIVAL', 'TEAM_BATTLE', 'TOWER_DEFENSE', 'WORD_HUNT']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">
              안녕하세요, {user?.name ?? session?.user?.name ?? '플레이어'}님! 👋
            </h1>
            <p className="text-gray-400">오늘도 즐거운 학습 되세요!</p>
          </div>
          <div className="flex gap-3">
            <Link href="/game/create">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                🎮 게임 만들기
              </Button>
            </Link>
            <Link href="/game/join">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                🚀 게임 참여하기
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {user?.level ?? 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm">레벨</p>
                    <p className="text-white font-bold text-lg">{levelTitle}</p>
                    <div className="mt-2">
                      <Progress value={user?.expNeeded ? (user.expProgress / user.expNeeded) * 100 : 0} className="h-2" />
                      <p className="text-xs text-gray-400 mt-1">
                        {user?.expProgress ?? 0} / {user?.expNeeded ?? 100} XP
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Points Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                    ⭐
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">총 점수</p>
                    <p className="text-3xl font-bold text-white">
                      {(user?.totalScore ?? 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-yellow-400">🪙 {user?.coins ?? 0} 코인</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                    🔥
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">연속 정답</p>
                    <p className="text-3xl font-bold text-white">{stats?.currentStreak ?? 0}회</p>
                    <p className="text-sm text-yellow-400">최고: {stats?.maxStreak ?? 0}회</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Games Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                    🏆
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">플레이 게임</p>
                    <p className="text-3xl font-bold text-white">{stats?.gamesPlayed ?? 0}</p>
                    <p className="text-sm text-cyan-400">
                      승률 {stats?.winRate ?? 0}% ({stats?.gamesWon ?? 0}승)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Modes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🎮 게임 모드
                </CardTitle>
                <CardDescription className="text-gray-400">
                  다양한 게임으로 학습해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {featuredGames.map((gameType) => {
                    const config = GAME_MODE_CONFIG[gameType]
                    return (
                      <Link key={gameType} href={`/game/create?type=${gameType}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl bg-gradient-to-br ${config.color} cursor-pointer transition-all hover:shadow-lg`}
                        >
                          <div className="text-4xl mb-2">{config.icon}</div>
                          <h3 className="font-bold text-white">{config.name}</h3>
                          <p className="text-white/70 text-xs mt-1 line-clamp-2">
                            {config.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs bg-black/20 text-white border-0">
                              {config.minPlayers}-{config.maxPlayers}명
                            </Badge>
                          </div>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
                <Link href="/games">
                  <Button variant="ghost" className="w-full mt-4 text-gray-400 hover:text-white">
                    모든 게임 모드 보기 →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🏅 업적
                </CardTitle>
                <CardDescription className="text-gray-400">
                  도전하고 보상을 받으세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-5xl mb-2">🎖️</div>
                  <p className="text-3xl font-bold text-white">
                    {stats?.achievementsUnlocked ?? 0} / {stats?.totalAchievements ?? 0}
                  </p>
                  <p className="text-gray-400 text-sm">업적 달성</p>
                  <Progress
                    value={stats?.totalAchievements ? (stats.achievementsUnlocked / stats.totalAchievements) * 100 : 0}
                    className="mt-4 h-2"
                  />
                </div>
                <Link href="/achievements">
                  <Button variant="ghost" className="w-full mt-4 text-gray-400 hover:text-white">
                    전체 업적 보기 →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                ⏱️ 최근 게임
              </CardTitle>
              <CardDescription className="text-gray-400">
                최근 플레이한 게임 기록
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentGames.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🎮</div>
                  <p>아직 플레이한 게임이 없습니다</p>
                  <p className="text-sm">게임을 시작해보세요!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentGames.map((game, index) => {
                    const config = GAME_MODE_CONFIG[game.gameType]
                    return (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-xl`}
                          >
                            {config?.icon || '🎮'}
                          </div>
                          <div>
                            <p className="font-medium text-white">{game.title}</p>
                            <p className="text-xs text-gray-400">{formatRelativeTime(game.playedAt)}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-400">점수</p>
                            <p className="text-xl font-bold text-white">{game.score.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">순위</p>
                            <p
                              className={`text-xl font-bold ${
                                game.rank === 1
                                  ? 'text-yellow-400'
                                  : game.rank <= 3
                                  ? 'text-blue-400'
                                  : 'text-white'
                              }`}
                            >
                              #{game.rank}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
              <Link href="/history">
                <Button variant="ghost" className="w-full mt-4 text-gray-400 hover:text-white">
                  전체 기록 보기 →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions for Teachers */}
        {(user?.role === 'TEACHER' || session?.user?.role === 'TEACHER') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      👨‍🏫 교사 도구
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      수업 관리 및 퀴즈 생성
                    </CardDescription>
                  </div>
                  {teacherStats && (
                    <div className="flex gap-6 text-right">
                      <div>
                        <p className="text-2xl font-bold text-white">{teacherStats.totalClassrooms}</p>
                        <p className="text-xs text-gray-400">학급</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{teacherStats.totalStudents}</p>
                        <p className="text-xs text-gray-400">학생</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{teacherStats.totalQuizSets}</p>
                        <p className="text-xs text-gray-400">퀴즈</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/classroom">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer text-center"
                    >
                      <div className="text-3xl mb-2">🏫</div>
                      <p className="text-white font-medium">학급 관리</p>
                    </motion.div>
                  </Link>
                  <Link href="/quiz/manage">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer text-center"
                    >
                      <div className="text-3xl mb-2">📝</div>
                      <p className="text-white font-medium">퀴즈 관리</p>
                    </motion.div>
                  </Link>
                  <Link href="/quiz/create">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer text-center"
                    >
                      <div className="text-3xl mb-2">🤖</div>
                      <p className="text-white font-medium">AI 퀴즈 생성</p>
                    </motion.div>
                  </Link>
                  <Link href="/reports">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer text-center"
                    >
                      <div className="text-3xl mb-2">📊</div>
                      <p className="text-white font-medium">학습 리포트</p>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
