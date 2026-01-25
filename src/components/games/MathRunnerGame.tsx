'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface MathRunnerGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface Obstacle {
  id: number
  x: number
  answer: string
  isCorrect: boolean
}

export default function MathRunnerGame({ questions, onComplete, timeLimit }: MathRunnerGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [distance, setDistance] = useState(0)
  const [playerLane, setPlayerLane] = useState(1) // 0, 1, 2 (좌, 중, 우)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [speed, setSpeed] = useState(1)
  const [isJumping, setIsJumping] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [streak, setStreak] = useState(0)

  const currentQuestion = questions[currentIndex % questions.length]

  // 장애물 생성
  useEffect(() => {
    if (gameOver || !currentQuestion) return

    // 현재 문제의 답과 오답들로 장애물 생성
    const correctAnswer = currentQuestion.answer
    const wrongAnswers = currentQuestion.options?.filter(o => o !== correctAnswer) || ['오답1', '오답2']

    const newObstacles: Obstacle[] = [
      { id: 1, x: 100, answer: wrongAnswers[0] || '오답', isCorrect: false },
      { id: 2, x: 100, answer: correctAnswer, isCorrect: true },
      { id: 3, x: 100, answer: wrongAnswers[1] || '오답', isCorrect: false },
    ]

    // 랜덤 배치
    newObstacles.sort(() => Math.random() - 0.5)
    newObstacles.forEach((obs, i) => {
      obs.id = i
    })

    setObstacles(newObstacles)
  }, [currentIndex, currentQuestion, gameOver])

  // 게임 루프
  useEffect(() => {
    if (gameOver) return

    const gameLoop = setInterval(() => {
      // 장애물 이동
      setObstacles(prev => prev.map(obs => ({
        ...obs,
        x: obs.x - speed * 2
      })))

      // 거리 증가
      setDistance(prev => prev + speed)

      // 충돌 체크
      setObstacles(prev => {
        const collision = prev.find(obs => obs.x <= 15 && obs.x >= 5)
        if (collision && collision.x <= 10 && collision.x >= 8) {
          // 플레이어 레인과 장애물 위치 비교
          const obsLane = prev.indexOf(collision)
          if (obsLane === playerLane && !isJumping) {
            // 충돌!
            if (collision.isCorrect) {
              // 정답!
              setIsCorrect(true)
              setShowResult(true)
              setCorrectCount(c => c + 1)
              setStreak(s => s + 1)
              setScore(s => s + 100 + streak * 20)
              setSpeed(s => Math.min(3, s + 0.1))
            } else {
              // 오답
              setIsCorrect(false)
              setShowResult(true)
              setStreak(0)
              setSpeed(s => Math.max(1, s - 0.3))
            }

            setTimeout(() => {
              setShowResult(false)
              setCurrentIndex(i => i + 1)
            }, 1500)

            return []
          }
        }
        return prev
      })

      // 목표 도달 체크
      if (distance >= questions.length * 500) {
        setGameOver(true)
        onComplete(score, correctCount)
      }
    }, 50)

    return () => clearInterval(gameLoop)
  }, [gameOver, speed, playerLane, isJumping, streak, distance, questions.length, score, correctCount, onComplete])

  // 키보드 조작
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPlayerLane(prev => Math.max(0, prev - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setPlayerLane(prev => Math.min(2, prev + 1))
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        if (!isJumping) {
          setIsJumping(true)
          setTimeout(() => setIsJumping(false), 500)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isJumping])

  // 모바일 터치 조작
  const handleLaneChange = (lane: number) => {
    setPlayerLane(lane)
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-orange-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 1, repeat: 3 }}
            className="text-[120px]"
          >
            🏃
          </motion.div>
          <h1 className="text-4xl font-bold text-white">러닝 완료!</h1>
          <p className="text-xl text-orange-400">{Math.floor(distance)}m 달성</p>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400 mt-2">정답 {correctCount}개 | 최고 속도 x{speed.toFixed(1)}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-orange-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <motion.span
              className="text-3xl"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              🏃
            </motion.span>
            <div>
              <h1 className="text-xl font-bold text-white">수학 러너</h1>
              <p className="text-sm text-gray-400">정답을 향해 달려라!</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-orange-400"
              >
                <span className="text-2xl">🔥</span>
                <span className="font-bold">{streak}연속</span>
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-2xl">📏</span>
              <span className="text-xl font-bold text-white">{Math.floor(distance)}m</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold text-cyan-400">x{speed.toFixed(1)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 문제 */}
      {currentQuestion && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 text-center">
            <p className="text-xl text-white font-bold">{currentQuestion.content}</p>
          </div>
        </div>
      )}

      {/* 게임 필드 */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 h-80 relative overflow-hidden">
          {/* 배경 라인 */}
          <div className="absolute inset-0 flex">
            {[0, 1, 2].map(lane => (
              <div
                key={lane}
                className={`flex-1 border-x border-white/10 ${lane === 1 ? 'bg-white/5' : ''}`}
              />
            ))}
          </div>

          {/* 장애물 */}
          {obstacles.map((obs, index) => (
            <motion.div
              key={`${currentIndex}-${obs.id}`}
              className="absolute top-1/4"
              style={{
                left: `${obs.x}%`,
                width: '30%',
                marginLeft: `${index * 33.33}%`
              }}
              animate={{ left: `${obs.x}%` }}
            >
              <div className={`mx-2 p-4 rounded-xl text-center font-bold text-lg ${
                obs.isCorrect
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-red-500 to-red-700'
              } text-white shadow-lg`}>
                {obs.answer}
              </div>
            </motion.div>
          ))}

          {/* 플레이어 */}
          <motion.div
            className="absolute bottom-8"
            animate={{
              left: `${playerLane * 33.33 + 16.66}%`,
              y: isJumping ? -50 : 0
            }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{ transform: 'translateX(-50%)' }}
          >
            <motion.span
              className="text-5xl"
              animate={{ rotate: isJumping ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              🏃
            </motion.span>
          </motion.div>

          {/* 결승선 표시 */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <p className="text-white/50 text-sm">
              🏁 결승선까지 {Math.max(0, questions.length * 500 - distance).toFixed(0)}m
            </p>
          </div>
        </div>

        {/* 모바일 컨트롤 */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[0, 1, 2].map(lane => (
            <Button
              key={lane}
              onClick={() => handleLaneChange(lane)}
              className={`py-8 text-xl ${
                playerLane === lane
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                  : 'bg-white/20'
              }`}
            >
              {lane === 0 ? '⬅️ 좌' : lane === 1 ? '⬆️ 중앙' : '➡️ 우'}
            </Button>
          ))}
        </div>

        {/* 조작 안내 */}
        <div className="mt-4 text-center text-white/50 text-sm">
          <p>키보드: ← → 이동 | ↑ 또는 스페이스바 점프</p>
          <p>모바일: 버튼을 터치하여 레인 변경</p>
        </div>
      </div>

      {/* 결과 오버레이 */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={isCorrect ? { y: [0, -30, 0] } : { x: [-20, 20, -20, 20, 0] }}
                className="text-[80px]"
              >
                {isCorrect ? '⭐' : '💥'}
              </motion.div>
              <h2 className={`text-3xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '정답! 가속!' : '오답! 감속!'}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
