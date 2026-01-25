'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface BingoGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface BingoCell {
  id: number
  content: string
  answer: string
  isMarked: boolean
  isCorrect: boolean | null
  row: number
  col: number
}

export default function BingoGame({ questions, onComplete, timeLimit }: BingoGameProps) {
  const [board, setBoard] = useState<BingoCell[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [bingoLines, setBingoLines] = useState<number[][]>([])
  const [totalTime, setTotalTime] = useState(timeLimit * 5)
  const [showQuestion, setShowQuestion] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)

  // 빙고판 초기화 (5x5)
  useEffect(() => {
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5).slice(0, 25)

    // 부족한 경우 질문 반복 사용
    while (shuffledQuestions.length < 25) {
      const randomQ = questions[Math.floor(Math.random() * questions.length)]
      shuffledQuestions.push(randomQ)
    }

    const newBoard: BingoCell[] = shuffledQuestions.map((q, i) => ({
      id: i,
      content: q.answer.length > 20 ? q.answer.substring(0, 20) + '...' : q.answer,
      answer: q.answer,
      isMarked: false,
      isCorrect: null,
      row: Math.floor(i / 5),
      col: i % 5
    }))

    setBoard(newBoard)
    setCurrentQuestion(questions[0])
  }, [questions])

  // 타이머
  useEffect(() => {
    if (gameComplete) return

    const timer = setInterval(() => {
      setTotalTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete(score, correctCount)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameComplete, score, correctCount, onComplete])

  // 빙고 체크
  const checkBingo = useCallback((updatedBoard: BingoCell[]) => {
    const newBingoLines: number[][] = []

    // 가로 체크
    for (let row = 0; row < 5; row++) {
      const rowCells = updatedBoard.filter(c => c.row === row && c.isMarked && c.isCorrect)
      if (rowCells.length === 5) {
        newBingoLines.push(rowCells.map(c => c.id))
      }
    }

    // 세로 체크
    for (let col = 0; col < 5; col++) {
      const colCells = updatedBoard.filter(c => c.col === col && c.isMarked && c.isCorrect)
      if (colCells.length === 5) {
        newBingoLines.push(colCells.map(c => c.id))
      }
    }

    // 대각선 체크
    const diag1 = [0, 6, 12, 18, 24]
    const diag2 = [4, 8, 12, 16, 20]

    if (diag1.every(id => updatedBoard[id]?.isMarked && updatedBoard[id]?.isCorrect)) {
      newBingoLines.push(diag1)
    }
    if (diag2.every(id => updatedBoard[id]?.isMarked && updatedBoard[id]?.isCorrect)) {
      newBingoLines.push(diag2)
    }

    setBingoLines(newBingoLines)
    return newBingoLines.length
  }, [])

  // 셀 클릭 처리
  const handleCellClick = (cellId: number) => {
    if (board[cellId].isMarked) return
    setSelectedCell(cellId)
    setShowQuestion(true)
  }

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string) => {
    if (selectedCell === null || !currentQuestion) return

    const cell = board[selectedCell]
    const correct = answer.toLowerCase().trim() === cell.answer.toLowerCase().trim()

    setIsCorrect(correct)
    setShowResult(true)

    // 보드 업데이트
    const updatedBoard = board.map(c =>
      c.id === selectedCell ? { ...c, isMarked: true, isCorrect: correct } : c
    )
    setBoard(updatedBoard)

    if (correct) {
      setCorrectCount(prev => prev + 1)

      // 점수 계산
      const basePoints = 100
      const bingoCount = checkBingo(updatedBoard)
      const bingoBonus = bingoCount * 500

      setScore(prev => prev + basePoints + bingoBonus)

      // 3빙고 이상이면 게임 완료
      if (bingoCount >= 3) {
        setTimeout(() => {
          setGameComplete(true)
          onComplete(score + basePoints + bingoBonus, correctCount + 1)
        }, 2000)
      }
    }

    // 다음 문제로
    setTimeout(() => {
      setShowResult(false)
      setShowQuestion(false)
      setSelectedCell(null)
      setTextAnswer('')

      const nextIndex = questionIndex + 1
      if (nextIndex < questions.length) {
        setQuestionIndex(nextIndex)
        setCurrentQuestion(questions[nextIndex])
      } else {
        // 문제 다 풀었으면 게임 완료
        setGameComplete(true)
        onComplete(score, correctCount)
      }
    }, 2000)
  }, [selectedCell, currentQuestion, board, questions, questionIndex, checkBingo, score, correctCount, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 셀이 빙고 라인에 있는지 확인
  const isCellInBingoLine = (cellId: number) => {
    return bingoLines.some(line => line.includes(cellId))
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-900 flex items-center justify-center p-4">
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
            🎯
          </motion.div>
          <h1 className="text-4xl font-bold text-white">빙고!</h1>
          <p className="text-xl text-cyan-400">{bingoLines.length}줄 빙고 달성!</p>
          <div className="bg-white/10 rounded-xl p-6 space-y-4">
            <p className="text-2xl text-white">총 점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400">정답 {correctCount}개</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎯</span>
            <div>
              <h1 className="text-xl font-bold text-white">빙고</h1>
              <p className="text-sm text-gray-400">정답을 맞춰 빙고를 완성하세요!</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* 빙고 수 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <span className="text-xl font-bold text-cyan-400">{bingoLines.length} 빙고</span>
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

      {/* 현재 문제 표시 */}
      {currentQuestion && !showQuestion && (
        <div className="max-w-4xl mx-auto mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-xl p-6"
          >
            <p className="text-sm text-cyan-400 mb-2">문제 {questionIndex + 1}</p>
            <p className="text-xl text-white text-center">{currentQuestion.content}</p>
            <p className="text-sm text-gray-400 mt-4 text-center">정답이 있는 칸을 클릭하세요!</p>
          </motion.div>
        </div>
      )}

      {/* 빙고판 */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-5 gap-2">
          {board.map((cell) => (
            <motion.button
              key={cell.id}
              whileHover={!cell.isMarked ? { scale: 1.05 } : {}}
              whileTap={!cell.isMarked ? { scale: 0.95 } : {}}
              onClick={() => handleCellClick(cell.id)}
              disabled={cell.isMarked}
              className={`aspect-square rounded-xl p-2 text-sm md:text-base font-medium transition-all ${
                cell.isMarked
                  ? cell.isCorrect
                    ? isCellInBingoLine(cell.id)
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-4 border-yellow-300'
                      : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                    : 'bg-gradient-to-br from-red-500 to-red-700 text-white/50'
                  : 'bg-white/10 hover:bg-white/20 text-white border-2 border-white/30'
              }`}
            >
              {cell.isMarked && cell.isCorrect && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="block text-2xl mb-1"
                >
                  ⭕
                </motion.span>
              )}
              {cell.isMarked && !cell.isCorrect && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="block text-2xl mb-1"
                >
                  ❌
                </motion.span>
              )}
              <span className={cell.isMarked && !cell.isCorrect ? 'line-through' : ''}>
                {cell.content}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 게임 규칙 */}
      <div className="max-w-2xl mx-auto mt-6">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4">
          <h3 className="text-lg font-bold text-white mb-2">🎯 게임 규칙</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• 문제를 보고 정답이 있는 칸을 클릭하세요</li>
            <li>• 가로, 세로, 대각선으로 5칸을 완성하면 빙고!</li>
            <li>• 빙고 1줄당 500점 보너스</li>
            <li>• 3줄 빙고를 달성하면 게임 완료!</li>
          </ul>
        </div>
      </div>

      {/* 답변 입력 모달 */}
      <AnimatePresence>
        {showQuestion && selectedCell !== null && currentQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-lg bg-gradient-to-br from-teal-800 to-cyan-900 rounded-2xl border-4 border-cyan-500/50 p-8"
            >
              <h3 className="text-xl font-bold text-white mb-2">선택한 칸</h3>
              <p className="text-2xl text-cyan-300 font-bold mb-6">{board[selectedCell].content}</p>

              <div className="bg-black/40 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">문제:</p>
                <p className="text-lg text-white">{currentQuestion.content}</p>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                이 칸이 정답이라면 "{board[selectedCell].content}"을(를) 입력하세요
              </p>

              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && textAnswer.trim() && handleSubmitAnswer(textAnswer.trim())}
                placeholder="정답 입력..."
                className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 mb-4"
                autoFocus
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowQuestion(false)
                    setSelectedCell(null)
                    setTextAnswer('')
                  }}
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                >
                  취소
                </Button>
                <Button
                  onClick={() => handleSubmitAnswer(textAnswer.trim())}
                  disabled={!textAnswer.trim()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500"
                >
                  확인
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 결과 모달 */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                className="text-[100px]"
              >
                {isCorrect ? '⭕' : '❌'}
              </motion.div>
              <h2 className={`text-4xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '정답!' : '오답!'}
              </h2>
              {bingoLines.length > 0 && isCorrect && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl text-yellow-400 mt-4"
                >
                  🎉 {bingoLines.length}빙고!
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
