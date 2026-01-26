'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Question } from '@/types/game'
import QuestionAnswer from './QuestionAnswer'

interface SpeedRaceGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

export default function SpeedRaceGame({ questions, onComplete, timeLimit }: SpeedRaceGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalTime, setTotalTime] = useState(timeLimit * questions.length / 2) // 총 제한시간
  const [racePosition, setRacePosition] = useState(0) // 0-100%
  const [boostActive, setBoostActive] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [streak, setStreak] = useState(0)
  const [speed, setSpeed] = useState(1)

  const currentQuestion = questions[currentIndex]
  const finishLine = 100

  // 타이머 및 자동 이동
  useEffect(() => {
    if (gameComplete || showResult) return

    const timer = setInterval(() => {
      setTotalTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameComplete(true)
          onComplete(score, correctCount)
          return 0
        }
        return prev - 1
      })

      // 시간이 지나면 약간 후퇴
      setRacePosition(prev => Math.max(0, prev - 0.5))
    }, 1000)

    return () => clearInterval(timer)
  }, [gameComplete, showResult, score, correctCount, onComplete])

  // 골인 체크
  useEffect(() => {
    if (racePosition >= finishLine && !gameComplete) {
      setGameComplete(true)
      onComplete(score, correctCount)
    }
  }, [racePosition, gameComplete, score, correctCount, onComplete])

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string) => {
    if (!currentQuestion || showResult) return

    setSelectedAnswer(answer)
    const correct = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setCorrectCount(prev => prev + 1)
      setStreak(prev => prev + 1)

      // 점수 계산
      const basePoints = 100
      const speedBonus = Math.floor(speed * 20)
      setScore(prev => prev + basePoints + speedBonus)

      // 전진!
      const moveDistance = 10 + streak * 2 + (boostActive ? 10 : 0)
      setRacePosition(prev => Math.min(finishLine, prev + moveDistance))

      // 속도 증가
      setSpeed(prev => Math.min(3, prev + 0.2))

      // 3연속 정답시 부스트
      if ((streak + 1) % 3 === 0) {
        setBoostActive(true)
        setTimeout(() => setBoostActive(false), 5000)
      }
    } else {
      setStreak(0)
      setSpeed(1)
      // 후퇴
      setRacePosition(prev => Math.max(0, prev - 5))
    }

    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      setTextAnswer('')

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        // 문제 반복
        setCurrentIndex(0)
      }
    }, 1500)
  }, [currentQuestion, showResult, streak, boostActive, currentIndex, questions.length, speed])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (gameComplete) {
    const won = racePosition >= finishLine
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-900 flex items-center justify-center p-4">
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
            {won ? '🏆' : '🚗'}
          </motion.div>
          <h1 className="text-4xl font-bold text-white">
            {won ? '우승!' : '레이스 종료'}
          </h1>
          <p className="text-xl text-cyan-400">
            {won ? '결승선을 통과했습니다!' : `${Math.floor(racePosition)}% 도달`}
          </p>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400 mt-2">정답 {correctCount}개 | 최고 속도 x{speed.toFixed(1)}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <motion.span
              className="text-3xl"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🚀
            </motion.span>
            <div>
              <h1 className="text-xl font-bold text-white">스피드 레이스</h1>
              <p className="text-sm text-gray-400">빨리 정답을 맞춰 결승선에 도달하세요!</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {boostActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="flex items-center gap-2 text-orange-400"
              >
                <span className="text-2xl">🔥</span>
                <span className="font-bold">부스트!</span>
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold text-cyan-400">x{speed.toFixed(1)}</span>
            </div>

            <div className={`flex items-center gap-2 ${totalTime <= 30 ? 'text-red-400' : 'text-white'}`}>
              <span className="text-2xl">⏱️</span>
              <span className="text-xl font-bold">{formatTime(totalTime)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 레이스 트랙 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70">🏁 레이스 진행</span>
            <span className="text-cyan-400">{Math.floor(racePosition)}%</span>
          </div>
          <div className="relative h-12 bg-gray-800 rounded-full overflow-hidden">
            {/* 트랙 마커 */}
            {[25, 50, 75].map(mark => (
              <div
                key={mark}
                className="absolute top-0 bottom-0 w-0.5 bg-white/20"
                style={{ left: `${mark}%` }}
              />
            ))}

            {/* 결승선 */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-r from-white to-gray-300" />

            {/* 자동차 */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2"
              animate={{ left: `${Math.min(racePosition, 95)}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <motion.span
                className="text-3xl"
                animate={boostActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3, repeat: boostActive ? Infinity : 0 }}
              >
                🚗
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 문제 */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/40 backdrop-blur-md rounded-2xl p-8 mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
            {currentQuestion.content}
          </h2>
        </motion.div>

        {/* 답변 - 모든 유형 지원 */}
        <QuestionAnswer
          question={currentQuestion}
          onAnswer={handleSubmitAnswer}
          disabled={showResult}
        />
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
                animate={isCorrect ? { y: [0, -30, 0] } : { x: [-10, 10, -10, 10, 0] }}
                className="text-[80px]"
              >
                {isCorrect ? '🚀' : '💥'}
              </motion.div>
              <h2 className={`text-3xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? `+${10 + streak * 2}% 전진!` : '-5% 후퇴!'}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
