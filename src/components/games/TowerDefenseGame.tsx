'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface TowerDefenseGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface Enemy {
  id: number
  position: number // 0-100
  health: number
  maxHealth: number
  speed: number
  reward: number
}

interface Tower {
  id: number
  damage: number
  level: number
}

export default function TowerDefenseGame({ questions, onComplete, timeLimit }: TowerDefenseGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [gold, setGold] = useState(100)
  const [castleHealth, setCastleHealth] = useState(100)
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [towers, setTowers] = useState<Tower[]>([{ id: 1, damage: 20, level: 1 }])
  const [wave, setWave] = useState(1)
  const [showQuestion, setShowQuestion] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [waveComplete, setWaveComplete] = useState(false)

  const currentQuestion = questions[currentIndex % questions.length]

  // 적 스폰
  useEffect(() => {
    if (gameOver || showQuestion || waveComplete) return

    const spawnInterval = setInterval(() => {
      if (enemies.length < 5) {
        const newEnemy: Enemy = {
          id: Date.now(),
          position: 0,
          health: 50 + wave * 10,
          maxHealth: 50 + wave * 10,
          speed: 1 + wave * 0.2,
          reward: 20 + wave * 5
        }
        setEnemies(prev => [...prev, newEnemy])
      }
    }, 3000 / wave)

    return () => clearInterval(spawnInterval)
  }, [gameOver, showQuestion, wave, enemies.length, waveComplete])

  // 적 이동 및 타워 공격
  useEffect(() => {
    if (gameOver || showQuestion) return

    const gameLoop = setInterval(() => {
      setEnemies(prev => {
        const updated = prev.map(enemy => {
          // 타워 공격
          let damage = 0
          towers.forEach(tower => {
            if (enemy.position > 20 && enemy.position < 80) {
              damage += tower.damage * tower.level * 0.1
            }
          })

          const newHealth = enemy.health - damage
          const newPosition = enemy.position + enemy.speed

          return {
            ...enemy,
            health: newHealth,
            position: newPosition
          }
        })

        // 죽은 적 처리
        const alive: Enemy[] = []
        updated.forEach(enemy => {
          if (enemy.health <= 0) {
            setGold(g => g + enemy.reward)
            setScore(s => s + enemy.reward)
          } else if (enemy.position >= 100) {
            setCastleHealth(h => h - 10)
          } else {
            alive.push(enemy)
          }
        })

        return alive
      })
    }, 100)

    return () => clearInterval(gameLoop)
  }, [gameOver, showQuestion, towers])

  // 성 체력 체크
  useEffect(() => {
    if (castleHealth <= 0 && !gameOver) {
      setGameOver(true)
      onComplete(score, correctCount)
    }
  }, [castleHealth, gameOver, score, correctCount, onComplete])

  // 웨이브 완료 체크
  useEffect(() => {
    if (enemies.length === 0 && !showQuestion && !waveComplete && wave > 0) {
      // 일정 시간 후 웨이브 완료 체크
      const timer = setTimeout(() => {
        if (enemies.length === 0) {
          setWaveComplete(true)
          setShowQuestion(true)
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [enemies.length, showQuestion, waveComplete, wave])

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string) => {
    if (!currentQuestion) return

    setSelectedAnswer(answer)
    const correct = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setCorrectCount(prev => prev + 1)
      setGold(prev => prev + 50)
      setScore(prev => prev + 100)
      // 타워 강화
      setTowers(prev => prev.map(t => ({ ...t, damage: t.damage + 5 })))
    }

    setTimeout(() => {
      setShowResult(false)
      setShowQuestion(false)
      setSelectedAnswer(null)
      setTextAnswer('')
      setWaveComplete(false)
      setCurrentIndex(prev => prev + 1)
      setWave(prev => prev + 1)

      // 10웨이브 클리어시 완료
      if (wave >= 10) {
        setGameOver(true)
        onComplete(score + (correct ? 100 : 0), correctCount + (correct ? 1 : 0))
      }
    }, 2000)
  }, [currentQuestion, wave, score, correctCount, onComplete])

  // 타워 업그레이드
  const upgradeTower = (towerId: number) => {
    const cost = 50 * (towers.find(t => t.id === towerId)?.level || 1)
    if (gold >= cost) {
      setGold(prev => prev - cost)
      setTowers(prev => prev.map(t =>
        t.id === towerId ? { ...t, level: t.level + 1, damage: t.damage + 10 } : t
      ))
    }
  }

  if (gameOver) {
    const won = castleHealth > 0
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-amber-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: won ? [0, 10, -10, 0] : [0, -5, 5, 0] }}
            transition={{ duration: 1, repeat: 3 }}
            className="text-[120px]"
          >
            {won ? '🏰' : '💀'}
          </motion.div>
          <h1 className="text-4xl font-bold text-white">
            {won ? '방어 성공!' : '성이 함락되었습니다'}
          </h1>
          <p className="text-xl text-orange-400">
            {wave}웨이브까지 도달
          </p>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400 mt-2">정답 {correctCount}개</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-amber-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🏰</span>
            <div>
              <h1 className="text-xl font-bold text-white">타워 디펜스</h1>
              <p className="text-sm text-gray-400">웨이브 {wave} / 10</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">❤️</span>
              <span className={`text-xl font-bold ${castleHealth <= 30 ? 'text-red-400' : 'text-white'}`}>
                {castleHealth}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-yellow-400">{gold}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-white">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 게임 필드 */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 mb-4">
          {/* 경로 */}
          <div className="relative h-32 bg-gradient-to-r from-green-800 via-yellow-700 to-green-800 rounded-xl overflow-hidden">
            {/* 성 */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-5xl">🏰</div>

            {/* 타워 */}
            {towers.map((tower, i) => (
              <motion.div
                key={tower.id}
                className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${30 + i * 20}%` }}
                whileHover={{ scale: 1.1 }}
                onClick={() => upgradeTower(tower.id)}
              >
                <div className="text-4xl">🗼</div>
                <div className="text-xs text-center text-yellow-400">Lv.{tower.level}</div>
              </motion.div>
            ))}

            {/* 적들 */}
            {enemies.map(enemy => (
              <motion.div
                key={enemy.id}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${enemy.position}%` }}
              >
                <div className="text-3xl">👹</div>
                <div className="w-10 h-1 bg-gray-700 rounded-full mt-1">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}

            {/* 스폰 포인트 */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-3xl">🚩</div>
          </div>
        </div>

        {/* 타워 업그레이드 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {towers.map(tower => (
            <Button
              key={tower.id}
              onClick={() => upgradeTower(tower.id)}
              disabled={gold < 50 * tower.level}
              className="bg-gradient-to-r from-amber-500 to-orange-600 disabled:opacity-50"
            >
              🗼 타워 업그레이드 (💰{50 * tower.level})
            </Button>
          ))}
          {towers.length < 3 && gold >= 100 && (
            <Button
              onClick={() => {
                setGold(g => g - 100)
                setTowers(prev => [...prev, { id: Date.now(), damage: 20, level: 1 }])
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600"
            >
              + 새 타워 (💰100)
            </Button>
          )}
        </div>

        {/* 안내 */}
        {!showQuestion && (
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 text-center">
            <p className="text-white">적을 처치하고 웨이브를 클리어하세요!</p>
            <p className="text-gray-400 text-sm mt-2">웨이브 완료시 퀴즈가 출제됩니다</p>
          </div>
        )}
      </div>

      {/* 퀴즈 모달 */}
      <AnimatePresence>
        {showQuestion && currentQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-full max-w-2xl bg-gradient-to-br from-amber-800 to-orange-900 rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-yellow-400 mb-2 text-center">
                🏰 웨이브 {wave} 클리어!
              </h3>
              <p className="text-white/70 text-center mb-6">정답을 맞추면 타워가 강화됩니다!</p>

              <div className="bg-black/40 rounded-xl p-6 mb-6">
                <p className="text-xl text-white text-center">{currentQuestion.content}</p>
              </div>

              {showResult ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[80px]"
                  >
                    {isCorrect ? '✅' : '❌'}
                  </motion.div>
                  <p className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? '타워 강화!' : '다음 기회에!'}
                  </p>
                </div>
              ) : currentQuestion.type === 'SHORT_ANSWER' || !currentQuestion.options?.length ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && textAnswer.trim() && handleSubmitAnswer(textAnswer.trim())}
                    placeholder="정답을 입력하세요..."
                    className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white"
                    autoFocus
                  />
                  <Button
                    onClick={() => handleSubmitAnswer(textAnswer.trim())}
                    disabled={!textAnswer.trim()}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    제출
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options?.map((option, i) => (
                    <Button
                      key={i}
                      onClick={() => handleSubmitAnswer(option)}
                      className={`p-4 text-lg ${
                        ['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600'][i % 4]
                      }`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
