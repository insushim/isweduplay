'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { GAME_MODE_CONFIG, type GameType } from '@/types/game'

type Category = 'all' | 'solo' | 'multiplayer' | 'team' | 'educational'

const categories: { id: Category; name: string; icon: string }[] = [
  { id: 'all', name: '전체', icon: '🎮' },
  { id: 'multiplayer', name: '멀티플레이', icon: '👥' },
  { id: 'solo', name: '싱글플레이', icon: '🎯' },
  { id: 'team', name: '팀 대전', icon: '⚔️' },
  { id: 'educational', name: '학습 특화', icon: '📚' },
]

const gameCategories: Record<GameType, Category[]> = {
  QUIZ_BATTLE: ['multiplayer', 'educational'],
  SPEED_RACE: ['multiplayer'],
  SURVIVAL: ['multiplayer'],
  TEAM_BATTLE: ['team', 'multiplayer'],
  TOWER_DEFENSE: ['solo', 'educational'],
  MEMORY_MATCH: ['solo', 'educational'],
  WORD_HUNT: ['multiplayer', 'educational'],
  BINGO: ['multiplayer'],
  ESCAPE_ROOM: ['solo', 'team'],
  PUZZLE_QUEST: ['solo', 'educational'],
  MATH_RUNNER: ['multiplayer', 'educational'],
  WORD_CHAIN: ['multiplayer', 'educational'],
  JEOPARDY: ['multiplayer', 'educational'],
  WHEEL_FORTUNE: ['multiplayer'],
  FLASH_CARDS: ['solo', 'educational'],
  MATCHING_PAIRS: ['solo', 'educational'],
  FILL_THE_BLANKS: ['multiplayer', 'educational'],
  TIME_ATTACK: ['multiplayer', 'solo'],
}

export default function GamesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const gameTypes = Object.keys(GAME_MODE_CONFIG) as GameType[]

  const filteredGames = gameTypes.filter((gameType) => {
    const config = GAME_MODE_CONFIG[gameType]
    const matchesCategory =
      selectedCategory === 'all' ||
      gameCategories[gameType]?.includes(selectedCategory)
    const matchesSearch =
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-white">
            🎮 게임 모드
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            다양한 게임 모드로 재미있게 학습하세요. 친구들과 함께하면 더 즐거워요!
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Input
              type="text"
              placeholder="게임 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Game Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGames.map((gameType, index) => {
            const config = GAME_MODE_CONFIG[gameType]
            const gameCategory = gameCategories[gameType] || []

            return (
              <motion.div
                key={gameType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index % 6) }}
              >
                <Link href={`/game/create?type=${gameType}`}>
                  <Card
                    className={`h-full bg-gradient-to-br ${config.color} border-0 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl group overflow-hidden`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          className="text-5xl"
                        >
                          {config.icon}
                        </motion.div>
                        <div className="flex flex-col gap-1">
                          {gameCategory.includes('multiplayer') && (
                            <Badge className="bg-black/20 text-white border-0 text-xs">
                              멀티플레이
                            </Badge>
                          )}
                          {gameCategory.includes('educational') && (
                            <Badge className="bg-black/20 text-white border-0 text-xs">
                              학습 특화
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-white text-2xl mt-4">
                        {config.name}
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        {config.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white/70 text-sm">
                          <span>👥 {config.minPlayers}-{config.maxPlayers}명</span>
                          {config.defaultSettings.timeLimit && (
                            <span>⏱️ {config.defaultSettings.timeLimit}초</span>
                          )}
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-0 group-hover:bg-white group-hover:text-black transition-all"
                        >
                          시작하기 →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* No results */}
        {filteredGames.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-white mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-400">
              다른 검색어나 카테고리를 선택해보세요
            </p>
          </motion.div>
        )}

        {/* Quick Join Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    🚀 방 코드로 빠르게 참여하기
                  </h3>
                  <p className="text-gray-400">
                    선생님이나 친구가 알려준 방 코드를 입력하세요
                  </p>
                </div>
                <Link href="/game/join">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
                  >
                    게임 참여하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
