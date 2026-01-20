'use client'

import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GAME_MODE_CONFIG, type GameType } from '@/types/game'

// Calculate level progress
function calculateLevelProgress(experience: number) {
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

  return { level, progress, expInCurrentLevel, nextLevelExp: currentLevelExp }
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

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const levelData = calculateLevelProgress(user?.experience ?? 0)
  const levelTitle = getLevelTitle(user?.level ?? 1)

  // Mock recent games data
  const recentGames = [
    { id: '1', type: 'QUIZ_BATTLE', score: 850, rank: 2, date: '10분 전' },
    { id: '2', type: 'SPEED_RACE', score: 1200, rank: 1, date: '1시간 전' },
    { id: '3', type: 'SURVIVAL', score: 600, rank: 5, date: '3시간 전' },
  ]

  // Mock weekly ranking
  const weeklyRanking = [
    { rank: 1, name: '퀴즈왕', points: 15420, avatar: '👑' },
    { rank: 2, name: '학습마스터', points: 12300, avatar: '🥈' },
    { rank: 3, name: '게임천재', points: 11890, avatar: '🥉' },
    { rank: 4, name: user?.name ?? '나', points: user?.totalPoints ?? 0, isMe: true },
    { rank: 5, name: '도전자', points: 8500, avatar: '⭐' },
  ]

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
              안녕하세요, {user?.name ?? '플레이어'}님! 👋
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
                      <Progress value={levelData.progress} className="h-2" />
                      <p className="text-xs text-gray-400 mt-1">
                        {levelData.expInCurrentLevel} / {levelData.nextLevelExp} XP
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
                    <p className="text-gray-400 text-sm">총 포인트</p>
                    <p className="text-3xl font-bold text-white">
                      {(user?.totalPoints ?? 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-400">+1,250 이번 주</p>
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
                    <p className="text-gray-400 text-sm">연속 학습</p>
                    <p className="text-3xl font-bold text-white">7일</p>
                    <p className="text-sm text-yellow-400">최고 기록: 15일</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Rank Card */}
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
                    <p className="text-gray-400 text-sm">주간 순위</p>
                    <p className="text-3xl font-bold text-white">#4</p>
                    <p className="text-sm text-cyan-400">상위 10%</p>
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
                          className={`p-4 rounded-xl bg-gradient-to-br ${config.color} cursor-pointer transition-all hover:shadow-lg hover:shadow-${config.color.split('-')[1]}-500/20`}
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

          {/* Weekly Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🏅 주간 랭킹
                </CardTitle>
                <CardDescription className="text-gray-400">
                  이번 주 포인트 순위
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyRanking.map((player, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        player.isMe
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                          : 'bg-white/5'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
                          player.rank === 1
                            ? 'bg-yellow-500 text-black'
                            : player.rank === 2
                            ? 'bg-gray-400 text-black'
                            : player.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {player.rank <= 3 ? player.avatar : player.rank}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${player.isMe ? 'text-purple-300' : 'text-white'}`}>
                          {player.name}
                          {player.isMe && <span className="text-xs ml-2">(나)</span>}
                        </p>
                        <p className="text-sm text-gray-400">
                          {player.points.toLocaleString()} 포인트
                        </p>
                      </div>
                      {player.rank <= 3 && (
                        <div className="text-2xl">
                          {player.rank === 1 ? '👑' : player.rank === 2 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <Link href="/leaderboard">
                  <Button variant="ghost" className="w-full mt-4 text-gray-400 hover:text-white">
                    전체 순위 보기 →
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentGames.map((game, index) => {
                  const config = GAME_MODE_CONFIG[game.type as GameType]
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
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-xl`}
                        >
                          {config.icon}
                        </div>
                        <div>
                          <p className="font-medium text-white">{config.name}</p>
                          <p className="text-xs text-gray-400">{game.date}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-400">점수</p>
                          <p className="text-xl font-bold text-white">{game.score}</p>
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
              <Link href="/history">
                <Button variant="ghost" className="w-full mt-4 text-gray-400 hover:text-white">
                  전체 기록 보기 →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions for Teachers */}
        {user?.role === 'TEACHER' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  👨‍🏫 교사 도구
                </CardTitle>
                <CardDescription className="text-gray-400">
                  수업 관리 및 퀴즈 생성
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/classroom/create">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer text-center"
                    >
                      <div className="text-3xl mb-2">🏫</div>
                      <p className="text-white font-medium">학급 생성</p>
                    </motion.div>
                  </Link>
                  <Link href="/quiz/create">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer text-center"
                    >
                      <div className="text-3xl mb-2">📝</div>
                      <p className="text-white font-medium">퀴즈 만들기</p>
                    </motion.div>
                  </Link>
                  <Link href="/quiz/ai">
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
