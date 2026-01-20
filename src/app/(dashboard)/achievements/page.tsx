'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: string
  reward?: {
    type: string
    amount: number
  }
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      const data = await response.json()
      if (data.achievements) {
        setAchievements(data.achievements)
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'locked') return !a.unlocked
    return true
  })

  const categories = [...new Set(achievements.map(a => a.category))]
  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">업적</h1>
            <p className="text-white/70">도전하고 보상을 받으세요</p>
          </div>
          <Card className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 border-none">
            <div className="text-white/80 text-sm">달성률</div>
            <div className="text-2xl font-bold text-white">
              {achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0}%
            </div>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: '전체' },
            { key: 'unlocked', label: '달성' },
            { key: 'locked', label: '미달성' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === key
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              onClick={() => setFilter(key as typeof filter)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/70">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
            로딩 중...
          </div>
        ) : filteredAchievements.length === 0 ? (
          <Card className="p-12 bg-white/10 backdrop-blur border-white/20 text-center">
            <div className="text-4xl mb-4">🏅</div>
            <p className="text-white/70">
              {filter === 'unlocked'
                ? '아직 달성한 업적이 없습니다'
                : filter === 'locked'
                ? '모든 업적을 달성했습니다!'
                : '업적이 없습니다'}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {categories.map(category => {
              const categoryAchievements = filteredAchievements.filter(a => a.category === category)
              if (categoryAchievements.length === 0) return null

              return (
                <div key={category}>
                  <h2 className="text-xl font-semibold text-white mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryAchievements.map(achievement => (
                      <Card
                        key={achievement.id}
                        className={`p-4 border-none transition-all ${
                          achievement.unlocked
                            ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
                            : 'bg-white/10 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`text-4xl ${!achievement.unlocked && 'grayscale'}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{achievement.name}</h3>
                            <p className="text-sm text-white/70 mt-1">{achievement.description}</p>

                            {!achievement.unlocked && (
                              <div className="mt-3">
                                <div className="flex justify-between text-sm text-white/60 mb-1">
                                  <span>진행률</span>
                                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {achievement.unlocked && achievement.unlockedAt && (
                              <div className="mt-2 text-sm text-yellow-400">
                                ✨ {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')} 달성
                              </div>
                            )}

                            {achievement.reward && (
                              <div className="mt-2 text-sm text-white/60">
                                보상: {achievement.reward.type === 'coins' ? '🪙' : '⭐'} {achievement.reward.amount}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
