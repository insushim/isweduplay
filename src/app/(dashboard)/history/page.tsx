'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { GAME_MODE_CONFIG, type GameType } from '@/types/game'

interface GameHistory {
  id: string
  gameType: GameType
  title: string
  score: number
  rank: number
  totalPlayers: number
  correctCount: number
  totalQuestions: number
  playedAt: string
  duration: number
}

export default function HistoryPage() {
  const [history, setHistory] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | GameType>('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history')
      const data = await response.json()
      if (data.history) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(h => h.gameType === filter)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}분 ${secs}초`
  }

  const gameTypeOptions = Object.entries(GAME_MODE_CONFIG).map(([key, config]) => ({
    key: key as GameType,
    label: config.name,
  }))

  // Stats
  const totalGames = history.length
  const totalScore = history.reduce((sum, h) => sum + h.score, 0)
  const avgAccuracy = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + (h.correctCount / h.totalQuestions) * 100, 0) / history.length)
    : 0
  const wins = history.filter(h => h.rank === 1).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">게임 기록</h1>
          <p className="text-white/70">지금까지 플레이한 게임 기록을 확인하세요</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-none">
            <div className="text-3xl font-bold text-white">{totalGames}</div>
            <div className="text-sm text-white/70">총 게임</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-none">
            <div className="text-3xl font-bold text-white">{totalScore.toLocaleString()}</div>
            <div className="text-sm text-white/70">총 점수</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-none">
            <div className="text-3xl font-bold text-white">{avgAccuracy}%</div>
            <div className="text-sm text-white/70">평균 정답률</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-none">
            <div className="text-3xl font-bold text-white">{wins}</div>
            <div className="text-sm text-white/70">1등 횟수</div>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            onClick={() => setFilter('all')}
          >
            전체
          </button>
          {gameTypeOptions.slice(0, 6).map(({ key, label }) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === key
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* History List */}
        {loading ? (
          <div className="text-center py-12 text-white/70">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
            로딩 중...
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card className="p-12 bg-white/10 backdrop-blur border-white/20 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {filter === 'all' ? '아직 게임 기록이 없습니다' : '해당 게임 기록이 없습니다'}
            </h2>
            <p className="text-white/70">게임을 플레이하면 여기에 기록됩니다</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((game) => {
              const config = GAME_MODE_CONFIG[game.gameType]
              return (
                <Card
                  key={game.id}
                  className="p-4 bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${config?.color || 'from-gray-500 to-gray-600'}`}>
                      {config?.icon || '🎮'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{game.title}</h3>
                        {game.rank === 1 && <span className="text-yellow-400">🏆</span>}
                      </div>
                      <div className="text-sm text-white/70">
                        {config?.name} • {new Date(game.playedAt).toLocaleDateString('ko-KR')} • {formatDuration(game.duration)}
                      </div>
                    </div>
                    <div className="text-center px-4">
                      <div className="text-2xl font-bold text-white">{game.rank}위</div>
                      <div className="text-sm text-white/70">/{game.totalPlayers}명</div>
                    </div>
                    <div className="text-center px-4">
                      <div className="text-2xl font-bold text-green-400">{game.correctCount}/{game.totalQuestions}</div>
                      <div className="text-sm text-white/70">정답</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{game.score.toLocaleString()}</div>
                      <div className="text-sm text-white/70">점</div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
