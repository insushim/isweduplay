'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface MemoryMatchGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface Card {
  id: number
  content: string
  type: 'question' | 'answer'
  questionIndex: number
  isFlipped: boolean
  isMatched: boolean
}

export default function MemoryMatchGame({ questions, onComplete, timeLimit }: MemoryMatchGameProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [totalTime, setTotalTime] = useState(timeLimit * Math.min(questions.length, 8))
  const [gameStarted, setGameStarted] = useState(false)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [showMatch, setShowMatch] = useState(false)
  const [lastMatchedContent, setLastMatchedContent] = useState({ question: '', answer: '' })
  const isChecking = useRef(false)

  // 카드 초기화
  useEffect(() => {
    const limitedQuestions = questions.slice(0, 8) // 최대 8쌍 (16카드)
    const newCards: Card[] = []

    limitedQuestions.forEach((q, index) => {
      // 문제 카드
      newCards.push({
        id: index * 2,
        content: q.content.length > 50 ? q.content.substring(0, 50) + '...' : q.content,
        type: 'question',
        questionIndex: index,
        isFlipped: false,
        isMatched: false
      })
      // 답 카드
      newCards.push({
        id: index * 2 + 1,
        content: q.answer,
        type: 'answer',
        questionIndex: index,
        isFlipped: false,
        isMatched: false
      })
    })

    // 셔플
    const shuffled = [...newCards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
  }, [questions])

  // 타이머
  useEffect(() => {
    if (!gameStarted) return
    if (matchedPairs.length === cards.length / 2) return

    const timer = setInterval(() => {
      setTotalTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete(score, matchedPairs.length)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, matchedPairs.length, cards.length, score, onComplete])

  // 게임 완료 체크
  useEffect(() => {
    if (cards.length > 0 && matchedPairs.length === cards.length / 2) {
      setTimeout(() => {
        onComplete(score, matchedPairs.length)
      }, 1500)
    }
  }, [matchedPairs.length, cards.length, score, onComplete])

  // 카드 클릭 처리
  const handleCardClick = useCallback((cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true)
    }

    // 이미 뒤집힌 카드거나 매치된 카드면 무시
    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched || isChecking.current) return

    // 이미 2장이 뒤집혀 있으면 무시
    if (flippedCards.length >= 2) return

    // 카드 뒤집기
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    // 2장이 뒤집혔으면 매칭 체크
    if (newFlippedCards.length === 2) {
      isChecking.current = true
      setMoves(prev => prev + 1)

      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find(c => c.id === firstId)
      const secondCard = cards.find(c => c.id === secondId)

      if (firstCard && secondCard && firstCard.questionIndex === secondCard.questionIndex) {
        // 매칭 성공!
        const originalQuestion = questions[firstCard.questionIndex]
        setLastMatchedContent({
          question: originalQuestion.content,
          answer: originalQuestion.answer
        })
        setShowMatch(true)

        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.questionIndex === firstCard.questionIndex ? { ...c, isMatched: true } : c
          ))
          setMatchedPairs(prev => [...prev, firstCard.questionIndex])
          setFlippedCards([])

          // 점수 계산: 기본 100점 + 콤보 보너스
          const basePoints = 100
          const comboBonus = combo * 20
          setScore(prev => prev + basePoints + comboBonus)
          setCombo(prev => {
            const newCombo = prev + 1
            setMaxCombo(max => Math.max(max, newCombo))
            return newCombo
          })

          setShowMatch(false)
          isChecking.current = false
        }, 1000)
      } else {
        // 매칭 실패
        setCombo(0)
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
          ))
          setFlippedCards([])
          isChecking.current = false
        }, 1000)
      }
    }
  }, [cards, flippedCards, gameStarted, combo, questions])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 그리드 크기 계산
  const getGridCols = () => {
    const cardCount = cards.length
    if (cardCount <= 8) return 'grid-cols-4'
    if (cardCount <= 12) return 'grid-cols-4'
    return 'grid-cols-4 md:grid-cols-6'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-rose-900 to-pink-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🧠</span>
            <div>
              <h1 className="text-xl font-bold text-white">기억력 게임</h1>
              <p className="text-sm text-gray-400">짝을 맞춰 카드를 뒤집으세요!</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* 콤보 */}
            {combo > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-orange-400"
              >
                <span className="text-2xl">🔥</span>
                <span className="text-xl font-bold">{combo}x</span>
              </motion.div>
            )}

            {/* 매칭 수 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold text-green-400">
                {matchedPairs.length} / {cards.length / 2}
              </span>
            </div>

            {/* 시간 */}
            <div className={`flex items-center gap-2 ${totalTime <= 30 ? 'text-red-400' : 'text-white'}`}>
              <span className="text-2xl">⏱️</span>
              <span className="text-xl font-bold">{formatTime(totalTime)}</span>
            </div>

            {/* 점수 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 게임 시작 안내 */}
      {!gameStarted && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center"
        >
          <p className="text-yellow-300 text-lg">카드를 클릭하여 게임을 시작하세요!</p>
          <p className="text-yellow-200/70 text-sm mt-1">문제와 정답을 짝지어 맞추세요</p>
        </motion.div>
      )}

      {/* 카드 그리드 */}
      <div className="max-w-4xl mx-auto">
        <div className={`grid ${getGridCols()} gap-3 md:gap-4`}>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className="aspect-[3/4] relative cursor-pointer perspective-1000"
              onClick={() => handleCardClick(card.id)}
              whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
              whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
            >
              <motion.div
                className="w-full h-full relative preserve-3d"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* 카드 뒷면 */}
                <div
                  className={`absolute inset-0 rounded-xl backface-hidden flex items-center justify-center ${
                    card.isMatched
                      ? 'bg-green-500/50'
                      : 'bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500'
                  } border-4 border-white/30 shadow-lg`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {card.isMatched ? (
                    <span className="text-4xl">✓</span>
                  ) : (
                    <span className="text-4xl">❓</span>
                  )}
                </div>

                {/* 카드 앞면 */}
                <div
                  className={`absolute inset-0 rounded-xl backface-hidden flex items-center justify-center p-3 ${
                    card.type === 'question'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-br from-green-500 to-emerald-600'
                  } border-4 border-white/30 shadow-lg`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="text-center">
                    <div className="text-xs text-white/60 mb-1">
                      {card.type === 'question' ? '문제' : '정답'}
                    </div>
                    <p className="text-white font-medium text-sm md:text-base leading-tight">
                      {card.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 게임 통계 */}
      <div className="max-w-4xl mx-auto mt-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{moves}</p>
            <p className="text-sm text-gray-400">시도 횟수</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{maxCombo}</p>
            <p className="text-sm text-gray-400">최대 콤보</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">
              {matchedPairs.length > 0 ? Math.round((matchedPairs.length / (moves || 1)) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-400">정확도</p>
          </div>
        </div>
      </div>

      {/* 매칭 성공 애니메이션 */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 max-w-lg text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">짝을 맞췄습니다!</h3>
              <div className="space-y-2 bg-black/20 rounded-xl p-4">
                <p className="text-white/80 text-sm">문제:</p>
                <p className="text-white font-medium">{lastMatchedContent.question}</p>
                <p className="text-white/80 text-sm mt-2">정답:</p>
                <p className="text-yellow-300 font-bold text-lg">{lastMatchedContent.answer}</p>
              </div>
              {combo > 1 && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-orange-300 text-xl font-bold mt-4"
                >
                  🔥 {combo}x 콤보!
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  )
}
