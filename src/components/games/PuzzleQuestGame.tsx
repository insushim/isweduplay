'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Question } from '@/types/game'

interface PuzzleQuestGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface PuzzlePiece {
  id: number
  currentPos: number
  correctPos: number
  content: string
}

export default function PuzzleQuestGame({ questions, onComplete, timeLimit }: PuzzleQuestGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([])
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [totalTime, setTotalTime] = useState(timeLimit * 3)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [moves, setMoves] = useState(0)

  const currentQuestion = questions[currentIndex]

  // 퍼즐 초기화
  useEffect(() => {
    if (!currentQuestion) return

    // 정답을 조각으로 나누기
    const answer = currentQuestion.answer
    const pieces: PuzzlePiece[] = []

    if (answer.length <= 6) {
      // 짧은 답변: 글자별로
      answer.split('').forEach((char, i) => {
        pieces.push({
          id: i,
          currentPos: i,
          correctPos: i,
          content: char
        })
      })
    } else {
      // 긴 답변: 단어별로
      const words = answer.split(' ').filter(w => w)
      words.forEach((word, i) => {
        pieces.push({
          id: i,
          currentPos: i,
          correctPos: i,
          content: word
        })
      })
    }

    // 셔플
    const shuffled = [...pieces]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i].currentPos
      shuffled[i].currentPos = shuffled[j].currentPos
      shuffled[j].currentPos = temp
    }

    setPuzzlePieces(shuffled)
    setMoves(0)
  }, [currentQuestion, currentIndex])

  // 타이머
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
    }, 1000)

    return () => clearInterval(timer)
  }, [gameComplete, showResult, score, correctCount, onComplete])

  // 조각 클릭
  const handlePieceClick = (pieceId: number) => {
    if (selectedPiece === null) {
      setSelectedPiece(pieceId)
    } else {
      // 스왑
      setPuzzlePieces(prev => {
        const updated = [...prev]
        const piece1 = updated.find(p => p.id === selectedPiece)
        const piece2 = updated.find(p => p.id === pieceId)
        if (piece1 && piece2) {
          const temp = piece1.currentPos
          piece1.currentPos = piece2.currentPos
          piece2.currentPos = temp
        }
        return updated
      })
      setSelectedPiece(null)
      setMoves(prev => prev + 1)
    }
  }

  // 퍼즐 완성 체크
  const checkPuzzle = useCallback(() => {
    const isComplete = puzzlePieces.every(p => p.currentPos === p.correctPos)
    if (isComplete) {
      setIsCorrect(true)
      setShowResult(true)
      setCorrectCount(prev => prev + 1)

      // 점수: 기본 100 + 시간 보너스 - 이동 패널티
      const basePoints = 100
      const timeBonus = Math.floor(totalTime)
      const movePenalty = Math.max(0, (moves - puzzlePieces.length) * 5)
      setScore(prev => prev + basePoints + timeBonus - movePenalty)

      setTimeout(() => {
        setShowResult(false)
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          setGameComplete(true)
          onComplete(score + basePoints + timeBonus - movePenalty, correctCount + 1)
        }
      }, 2000)
    }
  }, [puzzlePieces, totalTime, moves, currentIndex, questions.length, score, correctCount, onComplete])

  // 자동 체크
  useEffect(() => {
    if (puzzlePieces.length > 0 && !showResult) {
      checkPuzzle()
    }
  }, [puzzlePieces, checkPuzzle, showResult])

  // 힌트 (하나의 조각을 올바른 위치로)
  const useHint = () => {
    const wrongPieces = puzzlePieces.filter(p => p.currentPos !== p.correctPos)
    if (wrongPieces.length > 0) {
      const randomWrong = wrongPieces[Math.floor(Math.random() * wrongPieces.length)]
      setPuzzlePieces(prev => {
        const updated = [...prev]
        const piece1 = updated.find(p => p.id === randomWrong.id)
        const piece2 = updated.find(p => p.currentPos === randomWrong.correctPos)
        if (piece1 && piece2) {
          const temp = piece1.currentPos
          piece1.currentPos = piece2.currentPos
          piece2.currentPos = temp
        }
        return updated
      })
      setScore(prev => Math.max(0, prev - 20))
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-900 flex items-center justify-center p-4">
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
            🧩
          </motion.div>
          <h1 className="text-4xl font-bold text-white">퍼즐 퀘스트 완료!</h1>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400 mt-2">{correctCount}개 퍼즐 완성</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🧩</span>
            <div>
              <h1 className="text-xl font-bold text-white">퍼즐 퀘스트</h1>
              <p className="text-sm text-gray-400">퍼즐 {currentIndex + 1} / {questions.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              <span className="text-xl font-bold text-white">{moves}</span>
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

      {/* 문제 */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 mb-6">
          <p className="text-lg text-emerald-400 mb-2">문제</p>
          <h2 className="text-2xl font-bold text-white text-center">
            {currentQuestion.content}
          </h2>
        </div>

        {/* 퍼즐 영역 */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 mb-6">
          <p className="text-sm text-gray-400 mb-4 text-center">조각을 클릭하여 순서를 맞추세요</p>

          <div className="flex flex-wrap justify-center gap-3">
            {[...puzzlePieces]
              .sort((a, b) => a.currentPos - b.currentPos)
              .map(piece => (
                <motion.button
                  key={piece.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePieceClick(piece.id)}
                  className={`px-6 py-4 rounded-xl text-xl font-bold transition-all ${
                    selectedPiece === piece.id
                      ? 'bg-yellow-500 text-black ring-4 ring-yellow-300'
                      : piece.currentPos === piece.correctPos
                        ? 'bg-green-500/50 text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {piece.content}
                </motion.button>
              ))}
          </div>

          {/* 현재 조합 표시 */}
          <div className="mt-6 p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-gray-400 mb-2">현재 조합:</p>
            <p className="text-xl text-white text-center font-medium">
              {[...puzzlePieces]
                .sort((a, b) => a.currentPos - b.currentPos)
                .map(p => p.content)
                .join(currentQuestion.answer.includes(' ') ? ' ' : '')}
            </p>
          </div>
        </div>

        {/* 힌트 버튼 */}
        <div className="flex justify-center">
          <Button
            onClick={useHint}
            variant="outline"
            className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
          >
            💡 힌트 사용 (-20점)
          </Button>
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
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1 }}
                className="text-[100px]"
              >
                🧩
              </motion.div>
              <h2 className="text-4xl font-bold text-green-400">퍼즐 완성!</h2>
              <p className="text-white/70 mt-4 text-xl">{currentQuestion.answer}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
