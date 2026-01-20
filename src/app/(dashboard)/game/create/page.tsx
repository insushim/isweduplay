'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GAME_MODE_CONFIG, type GameType } from '@/types/game'

export default function GameCreatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const typeParam = searchParams.get('type') as GameType | null

  const [selectedType, setSelectedType] = useState<GameType | null>(typeParam)
  const [step, setStep] = useState(typeParam ? 2 : 1)
  const [settings, setSettings] = useState({
    title: '',
    maxPlayers: 30,
    timeLimit: 30,
    questionCount: 10,
  })
  const [isCreating, setIsCreating] = useState(false)

  const gameTypes = Object.entries(GAME_MODE_CONFIG) as [GameType, typeof GAME_MODE_CONFIG[GameType]][]

  const handleSelectType = (type: GameType) => {
    setSelectedType(type)
    setStep(2)
  }

  const handleCreateGame = async () => {
    if (!selectedType) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/game/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: selectedType,
          title: settings.title || `${GAME_MODE_CONFIG[selectedType].name} 게임`,
          maxPlayers: settings.maxPlayers,
          settings: {
            timeLimit: settings.timeLimit,
            questionCount: settings.questionCount,
          },
        }),
      })

      const data = await response.json()

      if (data.roomCode) {
        router.push(`/game/play/${data.roomCode}`)
      } else {
        alert(data.error || '게임 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Game creation error:', error)
      alert('게임 생성 중 오류가 발생했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">게임 만들기</h1>
        <p className="text-white/70 mb-8">학생들과 함께할 게임을 선택하고 설정하세요</p>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-white/50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-500' : 'bg-white/20'}`}>1</div>
            <span>게임 선택</span>
          </div>
          <div className="w-12 h-0.5 bg-white/20" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-white/50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-500' : 'bg-white/20'}`}>2</div>
            <span>설정</span>
          </div>
          <div className="w-12 h-0.5 bg-white/20" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-white' : 'text-white/50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-500' : 'bg-white/20'}`}>3</div>
            <span>시작</span>
          </div>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gameTypes.map(([type, config]) => (
              <Card
                key={type}
                className={`p-4 cursor-pointer transition-all hover:scale-105 bg-gradient-to-br ${config.color} border-none`}
                onClick={() => handleSelectType(type)}
              >
                <div className="text-4xl mb-2">{config.icon}</div>
                <h3 className="font-bold text-white">{config.name}</h3>
                <p className="text-sm text-white/80 mt-1">{config.description}</p>
                <div className="mt-2 text-xs text-white/60">
                  {config.minPlayers}-{config.maxPlayers}명
                </div>
              </Card>
            ))}
          </div>
        )}

        {step === 2 && selectedType && (
          <div className="max-w-xl mx-auto">
            <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className={`text-5xl p-4 rounded-xl bg-gradient-to-br ${GAME_MODE_CONFIG[selectedType].color}`}>
                  {GAME_MODE_CONFIG[selectedType].icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{GAME_MODE_CONFIG[selectedType].name}</h2>
                  <p className="text-white/70">{GAME_MODE_CONFIG[selectedType].description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">게임 제목</label>
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                    placeholder={`${GAME_MODE_CONFIG[selectedType].name} 게임`}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">최대 참가자 수</label>
                  <input
                    type="number"
                    value={settings.maxPlayers}
                    onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
                    min={GAME_MODE_CONFIG[selectedType].minPlayers}
                    max={GAME_MODE_CONFIG[selectedType].maxPlayers}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">문제당 제한시간 (초)</label>
                  <input
                    type="number"
                    value={settings.timeLimit}
                    onChange={(e) => setSettings({ ...settings, timeLimit: parseInt(e.target.value) })}
                    min={10}
                    max={120}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">문제 수</label>
                  <input
                    type="number"
                    value={settings.questionCount}
                    onChange={(e) => setSettings({ ...settings, questionCount: parseInt(e.target.value) })}
                    min={5}
                    max={50}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    setStep(1)
                    setSelectedType(null)
                  }}
                >
                  뒤로
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  onClick={handleCreateGame}
                  disabled={isCreating}
                >
                  {isCreating ? '생성 중...' : '게임 만들기'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
