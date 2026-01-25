'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface TimeAttackGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

export default function TimeAttackGame({ questions, onComplete, timeLimit }: TimeAttackGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [bonusTime, setBonusTime] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [streak, setStreak] = useState(0)
  const [comboMultiplier, setComboMultiplier] = useState(1)
  const [showTimeBonus, setShowTimeBonus] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentQuestion = questions[currentIndex]

  // 타이머
  useEffect(() => {
    if (gameComplete || showResult) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameComplete(true)
          onComplete(score, correctCount)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameComplete, showResult, score, correctCount, onComplete])

  // 보너스 시간 효과
  useEffect(() => {
    if (bonusTime > 0) {
      setShowTimeBonus(true)
      setTimeRemaining(prev => prev + bonusTime)
      const timeout = setTimeout(() => {
        setShowTimeBonus(false)
        setBonusTime(0)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [bonusTime])

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string) => {
    if (!currentQuestion) return

    setSelectedAnswer(answer)
    const correct = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)

      // 콤보 배수 계산
      const multiplier = Math.min(4, 1 + Math.floor(newStreak / 3))
      setComboMultiplier(multiplier)

      // 점수 계산 (시간 보너스 + 콤보)
      const timeBonus = Math.floor(timeRemaining * 2)
      const baseScore = 100
      const totalScore = (baseScore + timeBonus) * multiplier

      setScore(prev => prev + totalScore)
      setCorrectCount(prev => prev + 1)

      // 3연속마다 +5초
      if (newStreak % 3 === 0) {
        setBonusTime(5)
      }
    } else {
      setStreak(0)
      setComboMultiplier(1)
      // 오답시 -3초
      setTimeRemaining(prev => Math.max(5, prev - 3))
    }

    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      setTextAnswer('')

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
        inputRef.current?.focus()
      } else {
        setGameComplete(true)
        onComplete(score + (correct ? 100 : 0), correctCount + (correct ? 1 : 0))
      }
    }, 1200)
  }, [currentQuestion, currentIndex, questions.length, timeRemaining, streak, score, correctCount, onComplete])

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-red-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 5 }}
            className="text-[120px]"
          >
            ⏱️
          </motion.div>
          <h1 className="text-4xl font-bold text-white">타임 어택 종료!</h1>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400 mt-2">
              정답 {correctCount}/{questions.length} | 최고 콤보 x{comboMultiplier}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-red-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <motion.span
              className="text-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ⏱️
            </motion.span>
            <div>
              <h1 className="text-xl font-bold text-white">타임 어택</h1>
              <p className="text-sm text-gray-400">문제 {currentIndex + 1} / {questions.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {streak > 0 && (
              <motion.div
                key={streak}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-2xl">🔥</span>
                <span className="text-xl font-bold text-orange-400">{streak}연속</span>
                {comboMultiplier > 1 && (
                  <span className="px-2 py-1 bg-yellow-500 rounded text-black text-sm font-bold">
                    x{comboMultiplier}
                  </span>
                )}
              </motion.div>
            )}

            <div className={`flex items-center gap-2 relative ${timeRemaining <= 10 ? 'text-red-400' : 'text-white'}`}>
              <motion.span
                className="text-2xl"
                animate={timeRemaining <= 10 ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ⏰
              </motion.span>
              <span className="text-3xl font-bold">{timeRemaining}s</span>

              <AnimatePresence>
                {showTimeBonus && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -20 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-6 right-0 text-green-400 font-bold"
                  >
                    +{bonusTime}s!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-2xl font-bold text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 시간 게이지 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="h-4 bg-black/40 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              timeRemaining <= 10
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : timeRemaining <= 30
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeRemaining / (timeLimit + 30)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 문제 */}
      {currentQuestion && (
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-white text-center">
                {currentQuestion.content}
              </h2>
            </div>

            {/* 답변 옵션 */}
            {currentQuestion.type === 'SHORT_ANSWER' || !currentQuestion.options?.length ? (
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && textAnswer.trim() && handleSubmitAnswer(textAnswer.trim())}
                  placeholder="빠르게 정답을 입력하세요!"
                  className="w-full px-6 py-4 text-xl bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-orange-400"
                  autoFocus
                  disabled={showResult}
                />
                <Button
                  onClick={() => handleSubmitAnswer(textAnswer.trim())}
                  disabled={!textAnswer.trim() || showResult}
                  className="w-full py-6 text-xl bg-gradient-to-r from-orange-500 to-red-500"
                >
                  제출 ⚡
                </Button>
              </div>
            ) : currentQuestion.type === 'TRUE_FALSE' ? (
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: 'O', color: 'from-blue-500 to-blue-700', icon: '⭕' },
                  { value: 'X', color: 'from-red-500 to-red-700', icon: '❌' }
                ].map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSubmitAnswer(opt.value)}
                    disabled={showResult}
                    className={`p-8 rounded-2xl bg-gradient-to-r ${opt.color} text-white font-bold shadow-xl disabled:opacity-50`}
                  >
                    <span className="text-5xl">{opt.icon}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options?.map((option, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubmitAnswer(option)}
                    disabled={showResult}
                    className={`p-6 text-lg font-bold rounded-xl transition-all ${
                      showResult && option.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
                        ? 'bg-green-500'
                        : showResult && selectedAnswer === option
                          ? 'bg-red-500'
                          : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'
                    } text-white disabled:opacity-70`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

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
                animate={isCorrect
                  ? { scale: [1, 1.5, 1], rotate: [0, 360] }
                  : { x: [-30, 30, -30, 30, 0] }
                }
                transition={{ duration: 0.5 }}
                className="text-[80px]"
              >
                {isCorrect ? '⚡' : '💥'}
              </motion.div>
              <h2 className={`text-4xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? `+${100 * comboMultiplier}점!` : '-3초!'}
              </h2>
              {!isCorrect && currentQuestion && (
                <p className="text-white/70 mt-2">정답: {currentQuestion.answer}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
