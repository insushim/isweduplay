'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface FlashCardsGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface CardStatus {
  known: boolean
  reviewed: boolean
}

export default function FlashCardsGame({ questions, onComplete, timeLimit }: FlashCardsGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardStatuses, setCardStatuses] = useState<CardStatus[]>([])
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalTime, setTotalTime] = useState(timeLimit * 3)
  const [gameComplete, setGameComplete] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [unknownCards, setUnknownCards] = useState<number[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)

  const currentQuestion = reviewMode
    ? questions[unknownCards[reviewIndex]]
    : questions[currentIndex]

  // 초기화
  useEffect(() => {
    setCardStatuses(questions.map(() => ({ known: false, reviewed: false })))
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

  // 카드 뒤집기
  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  // 알고 있음 표시
  const markAsKnown = useCallback(() => {
    if (reviewMode) {
      setCorrectCount(prev => prev + 1)
      setScore(prev => prev + 50)

      if (reviewIndex < unknownCards.length - 1) {
        setReviewIndex(prev => prev + 1)
        setIsFlipped(false)
      } else {
        setGameComplete(true)
        onComplete(score + 50, correctCount + 1)
      }
    } else {
      setCardStatuses(prev => prev.map((status, i) =>
        i === currentIndex ? { ...status, known: true, reviewed: true } : status
      ))
      setCorrectCount(prev => prev + 1)
      setScore(prev => prev + 100)
      moveToNext()
    }
  }, [reviewMode, reviewIndex, unknownCards.length, currentIndex, score, correctCount, onComplete])

  // 모름 표시
  const markAsUnknown = useCallback(() => {
    if (reviewMode) {
      if (reviewIndex < unknownCards.length - 1) {
        setReviewIndex(prev => prev + 1)
        setIsFlipped(false)
      } else {
        setGameComplete(true)
        onComplete(score, correctCount)
      }
    } else {
      setCardStatuses(prev => prev.map((status, i) =>
        i === currentIndex ? { ...status, known: false, reviewed: true } : status
      ))
      moveToNext()
    }
  }, [reviewMode, reviewIndex, unknownCards.length, currentIndex, score, correctCount, onComplete])

  // 다음 카드로
  const moveToNext = () => {
    setIsFlipped(false)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // 첫 번째 라운드 종료 - 모르는 카드 복습
      const unknown = cardStatuses
        .map((status, i) => (!status.known && status.reviewed) ? i : -1)
        .filter(i => i !== -1)

      if (unknown.length > 0) {
        setUnknownCards(unknown)
        setReviewMode(true)
        setReviewIndex(0)
      } else {
        setGameComplete(true)
        onComplete(score, correctCount)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (gameComplete) {
    const knownCount = cardStatuses.filter(s => s.known).length
    const accuracy = questions.length > 0 ? Math.round((knownCount / questions.length) * 100) : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-900 to-cyan-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 2, repeat: 2 }}
            className="text-[120px]"
          >
            📚
          </motion.div>
          <h1 className="text-4xl font-bold text-white">학습 완료!</h1>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400 mt-2">암기율: {accuracy}% ({knownCount}/{questions.length})</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-900 to-cyan-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-xl font-bold text-white">플래시 카드</h1>
              <p className="text-sm text-gray-400">
                {reviewMode
                  ? `복습: ${reviewIndex + 1}/${unknownCards.length}`
                  : `카드 ${currentIndex + 1}/${questions.length}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {reviewMode && (
              <span className="px-3 py-1 bg-orange-500 rounded-full text-white text-sm font-medium">
                복습 모드
              </span>
            )}

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

      {/* 진행률 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                cardStatuses[i]?.known
                  ? 'bg-green-500'
                  : cardStatuses[i]?.reviewed
                    ? 'bg-red-500'
                    : i === currentIndex
                      ? 'bg-yellow-400'
                      : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 플래시 카드 */}
      <div className="max-w-4xl mx-auto">
        <div
          className="relative h-80 cursor-pointer perspective-1000"
          onClick={flipCard}
        >
          <motion.div
            className="absolute inset-0 w-full h-full"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 앞면 (문제) */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-teal-700 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-sm text-cyan-200 mb-4">문제</p>
              <h2 className="text-2xl font-bold text-white text-center leading-relaxed">
                {currentQuestion.content}
              </h2>
              <p className="text-cyan-200 mt-6 text-sm">탭하여 정답 확인</p>
            </div>

            {/* 뒷면 (정답) */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-amber-200 mb-4">정답</p>
              <h2 className="text-3xl font-bold text-white text-center">
                {currentQuestion.answer}
              </h2>
              {currentQuestion.explanation && (
                <p className="text-amber-100 mt-4 text-center text-sm">
                  {currentQuestion.explanation}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* 버튼 */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={markAsUnknown}
            className="py-6 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-xl shadow-lg"
          >
            <span className="text-3xl mr-2">❌</span>
            모르겠어요
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={markAsKnown}
            className="py-6 rounded-2xl bg-gradient-to-r from-green-500 to-green-700 text-white font-bold text-xl shadow-lg"
          >
            <span className="text-3xl mr-2">✅</span>
            알고 있어요
          </motion.button>
        </div>

        {/* 단축키 안내 */}
        <div className="mt-6 text-center text-white/50 text-sm">
          <p>카드를 클릭하여 뒤집기 | 왼쪽: 모름 | 오른쪽: 알고 있음</p>
        </div>
      </div>
    </div>
  )
}
