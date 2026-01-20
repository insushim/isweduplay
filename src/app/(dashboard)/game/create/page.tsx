'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GAME_MODE_CONFIG, type GameType } from '@/types/game'

interface QuizSet {
  id: string
  title: string
  description?: string
  subject: string
  gradeGroup?: string
  questionCount: number
  playCount: number
}

interface Subject {
  id: string
  name: string
  icon?: string
}

export default function GameCreatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const typeParam = searchParams.get('type') as GameType | null

  const [selectedType, setSelectedType] = useState<GameType | null>(typeParam)
  const [step, setStep] = useState(typeParam ? 2 : 1)
  const [selectedQuizSet, setSelectedQuizSet] = useState<string | null>(null)
  const [quizSets, setQuizSets] = useState<QuizSet[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [loadingQuizSets, setLoadingQuizSets] = useState(false)
  const [settings, setSettings] = useState({
    title: '',
    maxPlayers: 30,
    timeLimit: 30,
    questionCount: 10,
  })
  const [isCreating, setIsCreating] = useState(false)

  const gameTypes = Object.entries(GAME_MODE_CONFIG) as [GameType, typeof GAME_MODE_CONFIG[GameType]][]

  // 퀴즈셋 로드
  useEffect(() => {
    const fetchQuizSets = async () => {
      setLoadingQuizSets(true)
      try {
        const response = await fetch('/api/quiz/sets')
        const data = await response.json()
        setQuizSets(data.quizSets || [])
      } catch (error) {
        console.error('Failed to fetch quiz sets:', error)
      } finally {
        setLoadingQuizSets(false)
      }
    }

    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects')
        const data = await response.json()
        setSubjects(data.subjects || [])
      } catch {
        // 과목 API가 없으면 기본값 사용
        setSubjects([
          { id: '1', name: '국어', icon: '📚' },
          { id: '2', name: '수학', icon: '🔢' },
          { id: '3', name: '영어', icon: '🔤' },
          { id: '4', name: '과학', icon: '🔬' },
          { id: '5', name: '사회', icon: '🌍' },
        ])
      }
    }

    if (step === 2) {
      fetchQuizSets()
      fetchSubjects()
    }
  }, [step])

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
          quizSetId: selectedQuizSet,
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

  const filteredQuizSets = selectedSubject === 'all'
    ? quizSets
    : quizSets.filter(q => q.subject === selectedSubject)

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
            <span>퀴즈 선택</span>
          </div>
          <div className="w-12 h-0.5 bg-white/20" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-white' : 'text-white/50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-500' : 'bg-white/20'}`}>3</div>
            <span>설정</span>
          </div>
        </div>

        {/* Step 1: Game Type Selection */}
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

        {/* Step 2: Quiz Set Selection */}
        {step === 2 && selectedType && (
          <div className="space-y-6">
            {/* Selected Game Type */}
            <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
              <div className="flex items-center gap-4">
                <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${GAME_MODE_CONFIG[selectedType].color}`}>
                  {GAME_MODE_CONFIG[selectedType].icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{GAME_MODE_CONFIG[selectedType].name}</h2>
                  <p className="text-white/70 text-sm">{GAME_MODE_CONFIG[selectedType].description}</p>
                </div>
                <Button
                  variant="ghost"
                  className="ml-auto text-white/70 hover:text-white"
                  onClick={() => { setStep(1); setSelectedType(null); }}
                >
                  변경
                </Button>
              </div>
            </Card>

            {/* Subject Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSubject === 'all' ? 'default' : 'outline'}
                className={selectedSubject === 'all' ? 'bg-indigo-500' : 'border-white/20 text-white hover:bg-white/10'}
                onClick={() => setSelectedSubject('all')}
              >
                전체
              </Button>
              {subjects.map((subject) => (
                <Button
                  key={subject.id}
                  variant={selectedSubject === subject.name ? 'default' : 'outline'}
                  className={selectedSubject === subject.name ? 'bg-indigo-500' : 'border-white/20 text-white hover:bg-white/10'}
                  onClick={() => setSelectedSubject(subject.name)}
                >
                  {subject.icon} {subject.name}
                </Button>
              ))}
            </div>

            {/* Quiz Sets List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">퀴즈셋 선택</h3>

              {loadingQuizSets ? (
                <div className="text-center py-8 text-white/70">
                  <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-2" />
                  퀴즈셋을 불러오는 중...
                </div>
              ) : filteredQuizSets.length === 0 ? (
                <Card className="p-8 bg-white/5 border-white/10 text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-white/70 mb-4">
                    {selectedSubject === 'all'
                      ? '아직 생성한 퀴즈셋이 없습니다.'
                      : `${selectedSubject} 과목의 퀴즈셋이 없습니다.`}
                  </p>
                  <Button
                    onClick={() => router.push('/quiz/manage')}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    퀴즈셋 만들기
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredQuizSets.map((quiz) => (
                    <Card
                      key={quiz.id}
                      className={`p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                        selectedQuizSet === quiz.id
                          ? 'bg-indigo-500/30 border-indigo-500'
                          : 'bg-white/10 border-white/20 hover:bg-white/15'
                      }`}
                      onClick={() => setSelectedQuizSet(quiz.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-white">{quiz.title}</h4>
                        {selectedQuizSet === quiz.id && (
                          <span className="text-green-400">✓</span>
                        )}
                      </div>
                      {quiz.description && (
                        <p className="text-white/60 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-white/10 rounded text-white/80">
                          {quiz.subject}
                        </span>
                        <span className="px-2 py-1 bg-white/10 rounded text-white/80">
                          {quiz.questionCount}문제
                        </span>
                        <span className="px-2 py-1 bg-white/10 rounded text-white/80">
                          {quiz.playCount}회 플레이
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => { setStep(1); setSelectedType(null); }}
              >
                뒤로
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                onClick={() => setStep(3)}
                disabled={!selectedQuizSet}
              >
                다음 단계
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Game Settings */}
        {step === 3 && selectedType && (
          <div className="max-w-xl mx-auto">
            <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className={`text-5xl p-4 rounded-xl bg-gradient-to-br ${GAME_MODE_CONFIG[selectedType].color}`}>
                  {GAME_MODE_CONFIG[selectedType].icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{GAME_MODE_CONFIG[selectedType].name}</h2>
                  <p className="text-white/70">게임 설정을 완료하세요</p>
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
                  onClick={() => setStep(2)}
                >
                  뒤로
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  onClick={handleCreateGame}
                  disabled={isCreating}
                >
                  {isCreating ? '생성 중...' : '🚀 게임 만들기'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
