'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Question } from '@/types/game'

interface SurvivalGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

export default function SurvivalGame({ questions, onComplete, timeLimit }: SurvivalGameProps) {
  const [lives, setLives] = useState(3)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [deathAnimation, setDeathAnimation] = useState(false)
  const [healAnimation, setHealAnimation] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [difficulty, setDifficulty] = useState(1) // 난이도 (시간이 줄어듦)

  const currentQuestion = questions[currentIndex]

  // 타이머
  useEffect(() => {
    if (showResult || gameOver || !currentQuestion) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // 시간 초과 = 오답 처리
          handleWrongAnswer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showResult, gameOver, currentQuestion, currentIndex])

  // 오답 처리
  const handleWrongAnswer = useCallback(() => {
    setIsCorrect(false)
    setShowResult(true)
    setStreak(0)
    setDeathAnimation(true)

    setLives(prev => {
      const newLives = prev - 1
      if (newLives <= 0) {
        setTimeout(() => {
          setGameOver(true)
          onComplete(score, correctCount)
        }, 2000)
      }
      return newLives
    })

    setTimeout(() => setDeathAnimation(false), 500)
  }, [score, correctCount, onComplete])

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string) => {
    if (!currentQuestion || showResult) return

    setSelectedAnswer(answer)
    const correct = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()

    if (correct) {
      setIsCorrect(true)
      setCorrectCount(prev => prev + 1)
      setStreak(prev => prev + 1)

      // 점수 계산
      const basePoints = 100
      const timeBonus = Math.floor(timeRemaining * 2)
      const streakBonus = streak * 20
      const difficultyBonus = difficulty * 50
      setScore(prev => prev + basePoints + timeBonus + streakBonus + difficultyBonus)

      // 5연속 정답시 생명력 회복
      if ((streak + 1) % 5 === 0 && lives < 3) {
        setLives(prev => Math.min(prev + 1, 3))
        setHealAnimation(true)
        setTimeout(() => setHealAnimation(false), 500)
      }

      setShowResult(true)
    } else {
      handleWrongAnswer()
    }
  }, [currentQuestion, showResult, timeRemaining, streak, difficulty, lives, handleWrongAnswer])

  // 다음 문제로
  useEffect(() => {
    if (!showResult || gameOver) return

    const timer = setTimeout(() => {
      if (currentIndex < questions.length - 1 && lives > 0) {
        setCurrentIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setTextAnswer('')
        setShowResult(false)

        // 난이도 증가 (5문제마다)
        if ((currentIndex + 1) % 5 === 0) {
          setDifficulty(prev => prev + 1)
        }

        // 다음 문제 시간 설정 (난이도에 따라 감소)
        const newTimeLimit = Math.max(10, timeLimit - difficulty * 2)
        setTimeRemaining(newTimeLimit)
      } else if (lives > 0) {
        // 모든 문제 완료
        setGameOver(true)
        onComplete(score, correctCount)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [showResult, gameOver, currentIndex, questions.length, lives, timeLimit, difficulty, score, correctCount, onComplete])

  const colors = [
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-yellow-600',
  ]

  if (gameOver) {
    const survived = lives > 0
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={survived ? { rotate: [0, 10, -10, 0] } : { scale: [1, 0.9, 1] }}
            transition={{ duration: 1, repeat: survived ? 3 : Infinity }}
            className="text-[120px]"
          >
            {survived ? '🏆' : '💀'}
          </motion.div>
          <h1 className="text-4xl font-bold text-white">
            {survived ? '생존 성공!' : '게임 오버'}
          </h1>
          <p className="text-xl text-gray-400">
            {survived
              ? `${questions.length}문제를 모두 통과했습니다!`
              : `${currentIndex + 1}번째 문제에서 탈락했습니다`
            }
          </p>
          <div className="bg-white/10 rounded-xl p-6 space-y-4">
            <p className="text-2xl text-white">총 점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{correctCount}</p>
                <p className="text-sm text-gray-400">정답</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">{streak}</p>
                <p className="text-sm text-gray-400">최대 연속</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{difficulty}</p>
                <p className="text-sm text-gray-400">도달 난이도</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💀</span>
            <div>
              <h1 className="text-xl font-bold text-white">서바이벌</h1>
              <p className="text-sm text-gray-400">살아남아라!</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* 목숨 */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={
                    i === lives - 1 && deathAnimation
                      ? { scale: [1, 0, 1], opacity: [1, 0, 0] }
                      : i === lives && healAnimation
                        ? { scale: [0, 1.2, 1] }
                        : {}
                  }
                  className={`text-3xl ${i < lives ? '' : 'opacity-30 grayscale'}`}
                >
                  ❤️
                </motion.span>
              ))}
            </div>

            {/* 연속 정답 */}
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-orange-400"
              >
                <span className="text-2xl">🔥</span>
                <span className="text-xl font-bold">{streak}</span>
              </motion.div>
            )}

            {/* 난이도 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold text-purple-400">Lv.{difficulty}</span>
            </div>

            {/* 점수 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 타이머 */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70">문제 {currentIndex + 1} / {questions.length}</span>
          <motion.span
            animate={{
              scale: timeRemaining <= 5 ? [1, 1.2, 1] : 1,
              color: timeRemaining <= 5 ? '#ef4444' : '#ffffff'
            }}
            transition={{ duration: 0.5, repeat: timeRemaining <= 5 ? Infinity : 0 }}
            className="text-xl font-bold"
          >
            ⏱️ {timeRemaining}초
          </motion.span>
        </div>
        <Progress
          value={(timeRemaining / (timeLimit - difficulty * 2 + 2)) * 100}
          className="h-3"
        />
      </div>

      {/* 문제 */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/40 backdrop-blur-md rounded-2xl p-8 mb-6"
        >
          {currentQuestion.imageUrl && (
            <div className="mb-6">
              <img
                src={currentQuestion.imageUrl}
                alt="Question"
                className="max-h-48 mx-auto rounded-lg"
              />
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
            {currentQuestion.content}
          </h2>
        </motion.div>

        {/* 답변 */}
        {currentQuestion.type === 'SHORT_ANSWER' || !currentQuestion.options?.length ? (
          <div className="space-y-4">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && textAnswer.trim() && handleSubmitAnswer(textAnswer.trim())}
              placeholder="정답을 입력하세요..."
              disabled={showResult}
              className="w-full px-6 py-4 text-xl bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-red-400 disabled:opacity-50"
              autoFocus
            />
            <Button
              onClick={() => handleSubmitAnswer(textAnswer.trim())}
              disabled={!textAnswer.trim() || showResult}
              className="w-full py-6 text-xl bg-gradient-to-r from-red-500 to-red-700 disabled:opacity-50"
            >
              💀 제출
            </Button>
          </div>
        ) : currentQuestion.type === 'TRUE_FALSE' ? (
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: 'O', label: 'O', color: 'from-blue-500 to-blue-700', icon: '⭕' },
              { value: 'X', label: 'X', color: 'from-red-500 to-red-700', icon: '❌' }
            ].map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={!showResult ? { scale: 1.05 } : {}}
                whileTap={!showResult ? { scale: 0.95 } : {}}
                onClick={() => handleSubmitAnswer(opt.value)}
                disabled={showResult}
                className={`p-8 rounded-2xl bg-gradient-to-r ${opt.color} text-white font-bold shadow-xl ${
                  selectedAnswer === opt.value ? 'ring-4 ring-white' : ''
                } ${showResult && selectedAnswer !== opt.value ? 'opacity-40' : ''}`}
              >
                <span className="text-6xl block mb-2">{opt.icon}</span>
                <span className="text-3xl">{opt.label}</span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                onClick={() => handleSubmitAnswer(option)}
                disabled={showResult}
                className={`p-5 rounded-xl bg-gradient-to-r ${colors[index % 4]} text-white font-bold text-lg shadow-lg ${
                  selectedAnswer === option ? 'ring-4 ring-white' : ''
                } ${showResult && selectedAnswer !== option ? 'opacity-40' : ''}`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* 결과 오버레이 */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              <motion.div
                animate={
                  isCorrect
                    ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                    : { scale: [1, 0.9, 1.1, 0.95, 1] }
                }
                className="text-[100px]"
              >
                {isCorrect ? '✅' : '💀'}
              </motion.div>
              <h2 className={`text-4xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '생존!' : '피격!'}
              </h2>
              {!isCorrect && (
                <>
                  <p className="text-white/70 mt-4">정답: {currentQuestion?.answer}</p>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 flex justify-center gap-1"
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-3xl ${i < lives ? '' : 'opacity-30 grayscale'}`}
                      >
                        ❤️
                      </span>
                    ))}
                  </motion.div>
                  {lives > 0 && (
                    <p className="text-gray-400 mt-2">남은 기회: {lives}번</p>
                  )}
                </>
              )}
              {isCorrect && streak > 0 && streak % 5 === 0 && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-pink-400 text-xl mt-4"
                >
                  ❤️ 생명력 회복!
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 경고 효과 (목숨 1개일 때) */}
      {lives === 1 && !showResult && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="fixed inset-0 pointer-events-none border-8 border-red-500/50"
        />
      )}
    </div>
  )
}
