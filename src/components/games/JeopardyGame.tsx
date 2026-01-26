'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'
import QuestionAnswer from './QuestionAnswer'

interface JeopardyGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface Category {
  name: string
  questions: {
    points: number
    question: Question
    answered: boolean
  }[]
}

export default function JeopardyGame({ questions, onComplete, timeLimit }: JeopardyGameProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedQuestion, setSelectedQuestion] = useState<{ cat: number; q: number } | null>(null)
  const [showQuestion, setShowQuestion] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [answeredCount, setAnsweredCount] = useState(0)
  const totalQuestions = 15 // 5 categories x 3 point levels

  // 카테고리 초기화
  useEffect(() => {
    // 과목/주제별로 분류 (간단히 5개 카테고리로)
    const categoryNames = ['지식', '상식', '언어', '과학', '역사']
    const shuffled = [...questions].sort(() => Math.random() - 0.5)

    const newCategories: Category[] = categoryNames.map((name, catIndex) => ({
      name,
      questions: [100, 200, 300].map((points, qIndex) => ({
        points,
        question: shuffled[(catIndex * 3 + qIndex) % shuffled.length],
        answered: false
      }))
    }))

    setCategories(newCategories)
  }, [questions])

  // 게임 완료 체크
  useEffect(() => {
    if (answeredCount >= totalQuestions && !gameComplete) {
      setGameComplete(true)
      onComplete(score, correctCount)
    }
  }, [answeredCount, totalQuestions, gameComplete, score, correctCount, onComplete])

  // 정답 제출 (useCallback은 useEffect보다 먼저 선언해야 함)
  const handleSubmitAnswer = useCallback((answer: string) => {
    if (!selectedQuestion) return

    const category = categories[selectedQuestion.cat]
    const questionData = category.questions[selectedQuestion.q]
    const correct = answer.toLowerCase().trim() === questionData.question.answer.toLowerCase().trim()

    setIsCorrect(correct)
    setShowResult(true)
    setSelectedAnswer(answer)

    if (correct) {
      setScore(prev => prev + questionData.points)
      setCorrectCount(prev => prev + 1)
    } else {
      setScore(prev => prev - Math.floor(questionData.points / 2))
    }

    // 문제 완료 처리
    setCategories(prev => prev.map((cat, ci) => ({
      ...cat,
      questions: cat.questions.map((q, qi) =>
        ci === selectedQuestion.cat && qi === selectedQuestion.q
          ? { ...q, answered: true }
          : q
      )
    })))
    setAnsweredCount(prev => prev + 1)

    setTimeout(() => {
      setShowResult(false)
      setShowQuestion(false)
      setSelectedQuestion(null)
      setSelectedAnswer(null)
      setTextAnswer('')
    }, 3000)
  }, [selectedQuestion, categories])

  // 타이머
  useEffect(() => {
    if (!showQuestion || showResult) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitAnswer('')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showQuestion, showResult, handleSubmitAnswer])

  // 문제 선택
  const handleSelectQuestion = (catIndex: number, qIndex: number) => {
    if (categories[catIndex].questions[qIndex].answered) return

    setSelectedQuestion({ cat: catIndex, q: qIndex })
    setShowQuestion(true)
    setTimeRemaining(timeLimit)
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: 3 }}
            className="text-[120px]"
          >
            📺
          </motion.div>
          <h1 className="text-4xl font-bold text-white">제퍼디 종료!</h1>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">최종 점수: <span className={`font-bold ${score >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>${score}</span></p>
            <p className="text-gray-400 mt-2">정답 {correctCount} / {totalQuestions}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = selectedQuestion
    ? categories[selectedQuestion.cat].questions[selectedQuestion.q]
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">📺</span>
            <div>
              <h1 className="text-xl font-bold text-white">제퍼디</h1>
              <p className="text-sm text-gray-400">금액을 선택하고 문제를 맞추세요!</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="text-white">{answeredCount} / {totalQuestions}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className={`text-2xl font-bold ${score >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                ${score}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 제퍼디 보드 */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-5 gap-2">
          {/* 카테고리 헤더 */}
          {categories.map((cat, i) => (
            <div
              key={`header-${i}`}
              className="bg-blue-600 p-4 rounded-lg text-center"
            >
              <span className="text-white font-bold text-lg">{cat.name}</span>
            </div>
          ))}

          {/* 문제 셀 */}
          {[0, 1, 2].map(qIndex => (
            categories.map((cat, catIndex) => {
              const q = cat.questions[qIndex]
              return (
                <motion.button
                  key={`${catIndex}-${qIndex}`}
                  whileHover={!q.answered ? { scale: 1.05 } : {}}
                  whileTap={!q.answered ? { scale: 0.95 } : {}}
                  onClick={() => handleSelectQuestion(catIndex, qIndex)}
                  disabled={q.answered}
                  className={`p-6 rounded-lg text-center transition-all ${
                    q.answered
                      ? 'bg-gray-800/50 cursor-default'
                      : 'bg-blue-700 hover:bg-blue-600 cursor-pointer'
                  }`}
                >
                  {q.answered ? (
                    <span className="text-gray-500 text-2xl">-</span>
                  ) : (
                    <span className="text-yellow-400 font-bold text-2xl">${q.points}</span>
                  )}
                </motion.button>
              )
            })
          ))}
        </div>
      </div>

      {/* 문제 모달 */}
      <AnimatePresence>
        {showQuestion && currentQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="w-full max-w-3xl"
            >
              {showResult ? (
                <div className="bg-gradient-to-br from-blue-800 to-indigo-900 rounded-2xl p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[100px] mb-6"
                  >
                    {isCorrect ? '✅' : '❌'}
                  </motion.div>
                  <h2 className={`text-4xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? `+$${currentQuestion.points}!` : `-$${Math.floor(currentQuestion.points / 2)}`}
                  </h2>
                  {!isCorrect && (
                    <p className="text-white/70 text-xl">정답: {currentQuestion.question.answer}</p>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-800 to-indigo-900 rounded-2xl p-8">
                  {/* 금액 표시 */}
                  <div className="text-center mb-6">
                    <span className="text-yellow-400 text-4xl font-bold">${currentQuestion.points}</span>
                  </div>

                  {/* 타이머 */}
                  <div className="flex justify-center mb-6">
                    <div className={`text-3xl font-bold ${timeRemaining <= 5 ? 'text-red-400' : 'text-white'}`}>
                      ⏱️ {timeRemaining}
                    </div>
                  </div>

                  {/* 문제 */}
                  <div className="bg-blue-900/50 rounded-xl p-8 mb-6">
                    <p className="text-2xl text-white text-center leading-relaxed">
                      {currentQuestion.question.content}
                    </p>
                  </div>

                  {/* 답변 - 모든 유형 지원 */}
                  <QuestionAnswer
                    question={currentQuestion.question}
                    onAnswer={handleSubmitAnswer}
                    disabled={false}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
