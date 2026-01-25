'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Question } from '@/types/game'

interface MatchingPairsGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface Item {
  id: string
  content: string
  type: 'question' | 'answer'
  originalIndex: number
  matched: boolean
}

export default function MatchingPairsGame({ questions, onComplete, timeLimit }: MatchingPairsGameProps) {
  const [questionItems, setQuestionItems] = useState<Item[]>([])
  const [answerItems, setAnswerItems] = useState<Item[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalTime, setTotalTime] = useState(timeLimit * 3)
  const [gameComplete, setGameComplete] = useState(false)
  const [matchResult, setMatchResult] = useState<'correct' | 'wrong' | null>(null)
  const [attempts, setAttempts] = useState(0)

  // 초기화
  useEffect(() => {
    const limitedQuestions = questions.slice(0, 8)

    const qItems: Item[] = limitedQuestions.map((q, i) => ({
      id: `q-${i}`,
      content: q.content,
      type: 'question',
      originalIndex: i,
      matched: false
    }))

    const aItems: Item[] = limitedQuestions.map((q, i) => ({
      id: `a-${i}`,
      content: q.answer,
      type: 'answer',
      originalIndex: i,
      matched: false
    }))

    // 셔플
    setQuestionItems(qItems.sort(() => Math.random() - 0.5))
    setAnswerItems(aItems.sort(() => Math.random() - 0.5))
  }, [questions])

  // 타이머
  useEffect(() => {
    if (gameComplete) return

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
    }, 1000)

    return () => clearInterval(timer)
  }, [gameComplete, score, correctCount, onComplete])

  // 매칭 체크
  const checkMatch = useCallback(() => {
    if (!selectedQuestion || !selectedAnswer) return

    const qItem = questionItems.find(q => q.id === selectedQuestion)
    const aItem = answerItems.find(a => a.id === selectedAnswer)

    if (!qItem || !aItem) return

    setAttempts(prev => prev + 1)

    if (qItem.originalIndex === aItem.originalIndex) {
      // 매칭 성공
      setMatchResult('correct')
      setQuestionItems(prev => prev.map(item =>
        item.id === selectedQuestion ? { ...item, matched: true } : item
      ))
      setAnswerItems(prev => prev.map(item =>
        item.id === selectedAnswer ? { ...item, matched: true } : item
      ))
      setCorrectCount(prev => prev + 1)
      setScore(prev => prev + 100)

      setTimeout(() => {
        setMatchResult(null)
        setSelectedQuestion(null)
        setSelectedAnswer(null)

        // 모든 매칭 완료 체크
        const remainingQuestions = questionItems.filter(q => !q.matched && q.id !== selectedQuestion)
        if (remainingQuestions.length === 0) {
          setGameComplete(true)
          onComplete(score + 100, correctCount + 1)
        }
      }, 800)
    } else {
      // 매칭 실패
      setMatchResult('wrong')
      setScore(prev => Math.max(0, prev - 10))

      setTimeout(() => {
        setMatchResult(null)
        setSelectedQuestion(null)
        setSelectedAnswer(null)
      }, 800)
    }
  }, [selectedQuestion, selectedAnswer, questionItems, answerItems, score, correctCount, onComplete])

  // 선택 처리
  useEffect(() => {
    if (selectedQuestion && selectedAnswer) {
      checkMatch()
    }
  }, [selectedQuestion, selectedAnswer, checkMatch])

  const handleQuestionClick = (id: string) => {
    const item = questionItems.find(q => q.id === id)
    if (item?.matched || matchResult) return
    setSelectedQuestion(id)
  }

  const handleAnswerClick = (id: string) => {
    const item = answerItems.find(a => a.id === id)
    if (item?.matched || matchResult) return
    setSelectedAnswer(id)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (gameComplete) {
    const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-rose-900 to-pink-900 flex items-center justify-center p-4">
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
            🔗
          </motion.div>
          <h1 className="text-4xl font-bold text-white">매칭 완료!</h1>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400 mt-2">정확도: {accuracy}% ({correctCount}/{attempts} 시도)</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-rose-900 to-pink-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🔗</span>
            <div>
              <h1 className="text-xl font-bold text-white">짝 맞추기</h1>
              <p className="text-sm text-gray-400">문제와 정답을 연결하세요</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-xl font-bold text-green-400">{correctCount}/{questionItems.length}</span>
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

      {/* 매칭 영역 */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-8">
          {/* 문제 컬럼 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-pink-300 text-center mb-4">📝 문제</h3>
            {questionItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={!item.matched ? { scale: 1.02 } : {}}
                whileTap={!item.matched ? { scale: 0.98 } : {}}
                onClick={() => handleQuestionClick(item.id)}
                disabled={item.matched}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  item.matched
                    ? 'bg-green-500/30 text-green-200 cursor-default'
                    : selectedQuestion === item.id
                      ? 'bg-yellow-500 text-black ring-4 ring-yellow-300'
                      : 'bg-white/10 text-white hover:bg-white/20'
                } ${matchResult === 'wrong' && selectedQuestion === item.id ? 'animate-shake bg-red-500' : ''}`}
              >
                <p className="font-medium text-sm line-clamp-2">{item.content}</p>
              </motion.button>
            ))}
          </div>

          {/* 정답 컬럼 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-rose-300 text-center mb-4">✨ 정답</h3>
            {answerItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={!item.matched ? { scale: 1.02 } : {}}
                whileTap={!item.matched ? { scale: 0.98 } : {}}
                onClick={() => handleAnswerClick(item.id)}
                disabled={item.matched}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  item.matched
                    ? 'bg-green-500/30 text-green-200 cursor-default'
                    : selectedAnswer === item.id
                      ? 'bg-yellow-500 text-black ring-4 ring-yellow-300'
                      : 'bg-white/10 text-white hover:bg-white/20'
                } ${matchResult === 'wrong' && selectedAnswer === item.id ? 'animate-shake bg-red-500' : ''}`}
              >
                <p className="font-medium">{item.content}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-8 text-center text-white/50 text-sm">
          <p>왼쪽에서 문제를 선택하고, 오른쪽에서 해당하는 정답을 선택하세요</p>
        </div>
      </div>

      {/* 매칭 성공 이펙트 */}
      <AnimatePresence>
        {matchResult === 'correct' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, -30], opacity: [1, 0] }}
              transition={{ duration: 0.8 }}
              className="text-6xl"
            >
              ✅ +100
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
