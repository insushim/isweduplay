'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Question } from '@/types/game'

interface EscapeRoomGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface Room {
  id: number
  name: string
  description: string
  icon: string
  unlocked: boolean
  completed: boolean
  puzzleIndex: number
}

interface Clue {
  id: string
  content: string
  found: boolean
}

export default function EscapeRoomGame({ questions, onComplete, timeLimit }: EscapeRoomGameProps) {
  const [currentRoom, setCurrentRoom] = useState(0)
  const [totalTime, setTotalTime] = useState(timeLimit * questions.length)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [showPuzzle, setShowPuzzle] = useState(false)
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [clues, setClues] = useState<Clue[]>([])
  const [showClue, setShowClue] = useState(false)
  const [activeClue, setActiveClue] = useState<Clue | null>(null)
  const [keysFound, setKeysFound] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')

  // 방 목록 생성
  const [rooms] = useState<Room[]>(() => {
    const roomNames = ['입구', '거실', '서재', '비밀의 방', '탈출구']
    return questions.slice(0, 5).map((_, i) => ({
      id: i,
      name: roomNames[i] || `방 ${i + 1}`,
      description: i === 0 ? '탈출의 시작점입니다.' : '잠겨있습니다.',
      icon: ['🚪', '🛋️', '📚', '🔮', '🗝️'][i] || '🚪',
      unlocked: i === 0,
      completed: false,
      puzzleIndex: i
    }))
  })

  // 단서 생성
  useEffect(() => {
    const generatedClues: Clue[] = questions.map((q, i) => ({
      id: `clue-${i}`,
      content: q.hint || `이 퍼즐의 답은 "${q.answer.charAt(0)}..."로 시작합니다.`,
      found: false
    }))
    setClues(generatedClues)
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

  // 방 클릭 처리
  const handleRoomClick = (roomIndex: number) => {
    if (!rooms[roomIndex].unlocked) {
      return
    }
    if (rooms[roomIndex].completed) {
      return
    }
    setCurrentRoom(roomIndex)
    setCurrentPuzzleIndex(rooms[roomIndex].puzzleIndex)
    setShowPuzzle(true)
  }

  // 단서 찾기
  const handleFindClue = () => {
    if (clues[currentPuzzleIndex] && !clues[currentPuzzleIndex].found) {
      const updatedClues = [...clues]
      updatedClues[currentPuzzleIndex].found = true
      setClues(updatedClues)
      setActiveClue(updatedClues[currentPuzzleIndex])
      setShowClue(true)
    }
  }

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string) => {
    const currentQuestion = questions[currentPuzzleIndex]
    if (!currentQuestion) return

    setSelectedAnswer(answer)
    const correct = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      // 점수 계산
      const basePoints = 100
      const timeBonus = Math.floor(totalTime / 10)
      const totalPoints = basePoints + timeBonus

      setScore(prev => prev + totalPoints)
      setCorrectCount(prev => prev + 1)
      setKeysFound(prev => prev + 1)

      // 방 완료 및 다음 방 열기
      rooms[currentRoom].completed = true
      if (currentRoom < rooms.length - 1) {
        rooms[currentRoom + 1].unlocked = true
      }

      // 마지막 방이면 게임 완료
      if (currentRoom === rooms.length - 1) {
        setTimeout(() => {
          setGameComplete(true)
          onComplete(score + totalPoints, correctCount + 1)
        }, 2000)
      }
    }

    setTimeout(() => {
      setShowResult(false)
      setShowPuzzle(false)
      setSelectedAnswer(null)
      setTextAnswer('')
    }, 2500)
  }, [currentPuzzleIndex, questions, totalTime, currentRoom, rooms, score, correctCount, onComplete])

  const currentQuestion = questions[currentPuzzleIndex]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
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
            🎉
          </motion.div>
          <h1 className="text-4xl font-bold text-white">탈출 성공!</h1>
          <p className="text-xl text-amber-400">모든 퍼즐을 해결했습니다!</p>
          <div className="bg-white/10 rounded-xl p-6 space-y-4">
            <p className="text-2xl text-white">총 점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400">열쇠 {keysFound}개 발견 | 남은 시간: {formatTime(totalTime)}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🚪</span>
            <div>
              <h1 className="text-xl font-bold text-white">방탈출</h1>
              <p className="text-sm text-gray-400">퍼즐을 풀고 탈출하세요!</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* 열쇠 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗝️</span>
              <span className="text-xl font-bold text-yellow-400">{keysFound} / {rooms.length}</span>
            </div>

            {/* 시간 */}
            <div className={`flex items-center gap-2 ${totalTime <= 60 ? 'text-red-400' : 'text-white'}`}>
              <span className="text-2xl">⏱️</span>
              <span className="text-xl font-bold">{formatTime(totalTime)}</span>
            </div>

            {/* 점수 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-white">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 방 맵 */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-5 gap-4 mb-8">
          {rooms.map((room, index) => (
            <motion.button
              key={room.id}
              whileHover={room.unlocked && !room.completed ? { scale: 1.05 } : {}}
              whileTap={room.unlocked && !room.completed ? { scale: 0.95 } : {}}
              onClick={() => handleRoomClick(index)}
              className={`relative p-6 rounded-2xl border-4 transition-all ${
                room.completed
                  ? 'bg-green-500/20 border-green-500 cursor-default'
                  : room.unlocked
                    ? 'bg-amber-500/20 border-amber-500 cursor-pointer hover:bg-amber-500/30'
                    : 'bg-gray-800/50 border-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{room.icon}</div>
              <div className="text-lg font-bold text-white">{room.name}</div>
              {room.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                >
                  ✓
                </motion.div>
              )}
              {!room.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                  <span className="text-4xl">🔒</span>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* 진행 상황 */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70">탈출 진행도</span>
            <span className="text-amber-400">{Math.round((keysFound / rooms.length) * 100)}%</span>
          </div>
          <Progress value={(keysFound / rooms.length) * 100} className="h-3" />
        </div>

        {/* 수집한 단서 */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span>📝</span> 발견한 단서
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {clues.filter(c => c.found).map((clue, i) => (
              <div key={clue.id} className="bg-white/10 rounded-lg p-3 text-sm text-white/80">
                <span className="text-amber-400">#{i + 1}</span> {clue.content}
              </div>
            ))}
            {clues.filter(c => c.found).length === 0 && (
              <p className="text-gray-500 col-span-full">아직 발견한 단서가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 퍼즐 모달 */}
      <AnimatePresence>
        {showPuzzle && currentQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-2xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-4 border-amber-500/50 p-8"
            >
              {/* 방 이름 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{rooms[currentRoom].icon}</span>
                  <h2 className="text-2xl font-bold text-white">{rooms[currentRoom].name}</h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowPuzzle(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              {/* 퍼즐 내용 */}
              <div className="bg-black/40 rounded-xl p-6 mb-6">
                <p className="text-xl text-white text-center leading-relaxed">
                  {currentQuestion.content}
                </p>
                {currentQuestion.imageUrl && (
                  <img
                    src={currentQuestion.imageUrl}
                    alt="puzzle"
                    className="mt-4 max-h-48 mx-auto rounded-lg"
                  />
                )}
              </div>

              {/* 단서 찾기 버튼 */}
              {!clues[currentPuzzleIndex]?.found && (
                <Button
                  onClick={handleFindClue}
                  variant="outline"
                  className="w-full mb-4 border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                >
                  💡 단서 찾기 (-10초)
                </Button>
              )}

              {/* 답변 입력 */}
              {currentQuestion.type === 'SHORT_ANSWER' || !currentQuestion.options?.length ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && textAnswer.trim() && handleSubmitAnswer(textAnswer.trim())}
                    placeholder="정답을 입력하세요..."
                    className="w-full px-6 py-4 text-xl bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                  <Button
                    onClick={() => handleSubmitAnswer(textAnswer.trim())}
                    disabled={!textAnswer.trim()}
                    className="w-full py-6 text-xl bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    🔓 열쇠로 열기
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options?.map((option, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubmitAnswer(option)}
                      className={`p-4 rounded-xl border-2 text-lg font-medium transition-all ${
                        selectedAnswer === option
                          ? 'bg-amber-500 border-amber-400 text-white'
                          : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              )}
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
                {isCorrect ? '🗝️' : '❌'}
              </motion.div>
              <h2 className={`text-4xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '열쇠를 찾았습니다!' : '틀렸습니다!'}
              </h2>
              {!isCorrect && (
                <p className="text-white/70 mt-4">정답: {questions[currentPuzzleIndex]?.answer}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 단서 모달 */}
      <AnimatePresence>
        {showClue && activeClue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowClue(false)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="bg-amber-100 text-amber-900 rounded-xl p-8 max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-4xl mb-4 text-center">💡</div>
              <h3 className="text-xl font-bold mb-4 text-center">단서 발견!</h3>
              <p className="text-lg text-center">{activeClue.content}</p>
              <Button
                onClick={() => setShowClue(false)}
                className="w-full mt-6 bg-amber-600 hover:bg-amber-700"
              >
                확인
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
