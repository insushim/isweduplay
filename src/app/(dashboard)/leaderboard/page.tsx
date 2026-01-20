'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LeaderboardUser {
  id: string
  name: string
  avatar?: string
  totalScore: number
  gamesPlayed: number
  winRate: number
  level: number
  rank: number
}

type Period = 'daily' | 'weekly' | 'monthly' | 'all'

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('weekly')
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [period])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?period=${period}`)
      const data = await response.json()
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard)
        setMyRank(data.myRank)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-orange-700 text-white'
    return 'bg-white/10 text-white'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const periods: { key: Period; label: string }[] = [
    { key: 'daily', label: '오늘' },
    { key: 'weekly', label: '이번 주' },
    { key: 'monthly', label: '이번 달' },
    { key: 'all', label: '전체' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">리더보드</h1>
            <p className="text-white/70">최고의 플레이어들을 확인하세요</p>
          </div>
          {myRank && (
            <Card className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 border-none">
              <div className="text-white/70 text-sm">내 순위</div>
              <div className="text-2xl font-bold text-white">{myRank}위</div>
            </Card>
          )}
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {periods.map(({ key, label }) => (
            <Button
              key={key}
              variant={period === key ? 'default' : 'outline'}
              className={period === key
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-none'
                : 'border-white/20 text-white hover:bg-white/10'}
              onClick={() => setPeriod(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Leaderboard List */}
        <Card className="bg-white/10 backdrop-blur border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white/70">
              <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
              로딩 중...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-white/70">
              <div className="text-4xl mb-4">🏆</div>
              <p>아직 순위 데이터가 없습니다</p>
              <p className="text-sm mt-2">게임을 플레이하면 리더보드에 등록됩니다!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {leaderboard.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-white/5 ${getRankStyle(user.rank)}`}
                >
                  <div className="w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-full bg-black/20">
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.avatar || user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-sm text-white/70">
                      Lv.{user.level} • {user.gamesPlayed}게임 • 승률 {user.winRate}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{user.totalScore.toLocaleString()}</div>
                    <div className="text-sm text-white/70">점</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
