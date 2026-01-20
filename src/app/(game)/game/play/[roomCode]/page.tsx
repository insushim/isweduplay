'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { GameStatus, Question, GamePlayer, LeaderboardEntry } from '@/types/game'

// Types
interface GameData {
  id: string
  roomCode: string
  gameType: string
  status: string
  hostId: string
  quizSetId?: string
  settings: {
    timeLimit: number
    questionCount: number
  }
  questions: Question[]
}

// Game Components
function WaitingRoom({
  roomCode,
  isHost,
  playerCount,
  onStart,
}: {
  roomCode: string
  isHost: boolean
  playerCount: number
  onStart: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardContent className="p-8 text-center space-y-8">
            {/* Room Code Display */}
            <div className="space-y-2">
              <p className="text-gray-400">방 코드</p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex justify-center gap-2"
              >
                {roomCode.split('').map((char, i) => (
                  <div
                    key={i}
                    className="w-14 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-3xl font-bold text-black shadow-lg"
                  >
                    {char}
                  </div>
                ))}
              </motion.div>
              <p className="text-sm text-white/60 mt-4">
                이 코드를 학생들에게 공유하세요
              </p>
            </div>

            {/* Player Count */}
            <div className="py-6 border-y border-white/10">
              <div className="flex items-center justify-center gap-4">
                <div className="text-6xl">👥</div>
                <div className="text-left">
                  <p className="text-4xl font-bold text-white">{playerCount}</p>
                  <p className="text-gray-400">명 참가</p>
                </div>
              </div>
            </div>

            {/* Start Button (Host only) */}
            {isHost ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={onStart}
                  className="w-full md:w-auto px-12 py-6 text-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  🚀 게임 시작
                </Button>
                <p className="text-gray-500 text-sm mt-2">
                  준비가 되면 시작하세요
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xl text-white"
                >
                  호스트가 게임을 시작할 때까지 기다려주세요...
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function CountdownScreen({ seconds }: { seconds: number }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <motion.div
        key={seconds}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        className="text-[200px] font-bold text-white drop-shadow-2xl"
      >
        {seconds}
      </motion.div>
    </div>
  )
}

function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  timeRemaining,
  onAnswer,
  hasAnswered,
  selectedAnswer,
}: {
  question: Question
  questionIndex: number
  totalQuestions: number
  timeRemaining: number
  onAnswer: (answer: string) => void
  hasAnswered: boolean
  selectedAnswer: string | null
}) {
  const colors = [
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-yellow-600',
  ]

  const icons = ['🔴', '🔵', '🟢', '🟡']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge className="bg-white/10 text-white border-0">
            문제 {questionIndex + 1} / {totalQuestions}
          </Badge>
          <motion.div
            animate={{
              scale: timeRemaining <= 5 ? [1, 1.1, 1] : 1,
              color: timeRemaining <= 5 ? '#ef4444' : '#ffffff',
            }}
            transition={{ duration: 0.5, repeat: timeRemaining <= 5 ? Infinity : 0 }}
            className="flex items-center gap-2 text-2xl font-bold text-white"
          >
            ⏱️ {timeRemaining}
          </motion.div>
        </div>

        {/* Progress */}
        <Progress
          value={((question.timeLimit - timeRemaining) / question.timeLimit) * 100}
          className="h-2"
        />

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
        >
          {question.imageUrl && (
            <div className="mb-6">
              <img
                src={question.imageUrl}
                alt="Question"
                className="max-h-64 mx-auto rounded-lg"
              />
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
            {question.content}
          </h2>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options?.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isDisabled = hasAnswered && !isSelected

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                onClick={() => !hasAnswered && onAnswer(option)}
                disabled={hasAnswered}
                className={`p-6 rounded-xl bg-gradient-to-r ${colors[index % 4]} text-white font-bold text-xl shadow-lg transition-all ${
                  isSelected ? 'ring-4 ring-white' : ''
                } ${isDisabled ? 'opacity-50' : 'hover:shadow-xl'}`}
              >
                <span className="text-3xl mr-3">{icons[index % 4]}</span>
                {option}
              </motion.button>
            )
          })}
        </div>

        {/* Answered indicator */}
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 rounded-full text-green-400">
              ✓ 답변 완료! 결과를 기다리세요...
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function ResultsScreen({
  isCorrect,
  points,
  streak,
  correctAnswer,
  explanation,
}: {
  isCorrect: boolean
  points: number
  streak: number
  correctAnswer: string
  explanation?: string
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: isCorrect ? [0, 10, -10, 0] : [0, -5, 5, 0],
          }}
          transition={{ duration: 0.5 }}
          className="text-[120px]"
        >
          {isCorrect ? '🎉' : '😢'}
        </motion.div>

        <h2
          className={`text-4xl font-bold ${
            isCorrect ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isCorrect ? '정답!' : '틀렸어요'}
        </h2>

        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <p className="text-3xl font-bold text-yellow-400">+{points} 포인트</p>
            {streak > 1 && (
              <p className="text-orange-400">🔥 {streak}연속 정답!</p>
            )}
          </motion.div>
        )}

        {!isCorrect && (
          <div className="bg-white/10 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-gray-400">정답:</p>
            <p className="text-xl text-white font-medium">{correctAnswer}</p>
          </div>
        )}

        {explanation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-500/10 rounded-xl p-4 max-w-md mx-auto"
          >
            <p className="text-blue-400">💡 {explanation}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

function FinalResultsScreen({
  score,
  correctCount,
  totalQuestions,
  maxStreak,
}: {
  score: number
  correctCount: number
  totalQuestions: number
  maxStreak: number
}) {
  const router = useRouter()
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  // 등수 결정 (솔로 플레이에서는 점수 기반)
  let rank = 1
  let rankIcon = '🏆'
  let rankMessage = '훌륭해요!'

  if (accuracy >= 80) {
    rank = 1
    rankIcon = '🏆'
    rankMessage = '훌륭해요!'
  } else if (accuracy >= 60) {
    rank = 2
    rankIcon = '🥈'
    rankMessage = '잘했어요!'
  } else if (accuracy >= 40) {
    rank = 3
    rankIcon = '🥉'
    rankMessage = '좋아요!'
  } else {
    rank = 4
    rankIcon = '⭐'
    rankMessage = '다음엔 더 잘할 수 있어요!'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        {/* Winner celebration */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: 3 }}
            className="text-[100px]"
          >
            {rankIcon}
          </motion.div>
          <h1 className="text-4xl font-bold text-white">{rankMessage}</h1>
          <p className="text-gray-400 mt-2">정확도 {accuracy}%</p>
        </motion.div>

        {/* My stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{score}</p>
            <p className="text-sm text-gray-400">총 점수</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{correctCount}</p>
            <p className="text-sm text-gray-400">정답</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{maxStreak}</p>
            <p className="text-sm text-gray-400">최대 연속</p>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">정답률</span>
            <span className="text-white">{correctCount} / {totalQuestions}</span>
          </div>
          <Progress value={accuracy} className="h-3" />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 justify-center"
        >
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-500 to-emerald-500"
          >
            🔄 다시 하기
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            🏠 대시보드로
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

// Main Game Component
export default function GamePlayPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const roomCode = params.roomCode as string

  const [gameData, setGameData] = useState<GameData | null>(null)
  const [status, setStatus] = useState<GameStatus>('WAITING')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [countdownSeconds, setCountdownSeconds] = useState(3)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean
    points: number
  } | null>(null)

  // 게임 통계
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 게임 데이터 로드
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`/api/game/room/${roomCode}`)
        if (!response.ok) {
          throw new Error('게임을 찾을 수 없습니다')
        }
        const data = await response.json()
        setGameData(data.game)
        setTimeRemaining(data.game?.settings?.timeLimit || 30)
      } catch (err) {
        setError(err instanceof Error ? err.message : '게임 로드 실패')
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [roomCode])

  const isHost = gameData?.hostId === session?.user?.id
  const currentQuestion = gameData?.questions?.[currentQuestionIndex]
  const totalQuestions = gameData?.questions?.length || 0

  // 게임 시작 처리
  const handleStartGame = useCallback(() => {
    if (!gameData?.questions?.length) {
      alert('퀴즈 문제가 없습니다. 퀴즈셋을 먼저 선택해주세요.')
      return
    }
    setStatus('COUNTDOWN')
  }, [gameData])

  // Countdown timer
  useEffect(() => {
    if (status !== 'COUNTDOWN') return

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setStatus('IN_PROGRESS')
          setTimeRemaining(gameData?.settings?.timeLimit || 30)
          return 3
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, gameData])

  // Question timer
  useEffect(() => {
    if (status !== 'IN_PROGRESS' || !currentQuestion) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Time's up
          if (!hasAnswered) {
            setLastAnswerResult({ isCorrect: false, points: 0 })
            setStreak(0)
          }
          setStatus('SHOWING_RESULTS')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, currentQuestion, hasAnswered])

  // Handle answer submission
  const handleAnswer = useCallback(
    (answer: string) => {
      if (hasAnswered || !currentQuestion) return

      setSelectedAnswer(answer)
      setHasAnswered(true)

      const isCorrect = answer === currentQuestion.answer
      const timeLimit = currentQuestion.timeLimit || 30
      const points = isCorrect
        ? Math.floor(100 * (timeRemaining / timeLimit)) + 50
        : 0

      if (isCorrect) {
        setScore((prev) => prev + points)
        setCorrectCount((prev) => prev + 1)
        setStreak((prev) => {
          const newStreak = prev + 1
          setMaxStreak((max) => Math.max(max, newStreak))
          return newStreak
        })
      } else {
        setStreak(0)
      }

      setLastAnswerResult({ isCorrect, points })

      // Show results after a short delay
      setTimeout(() => {
        setStatus('SHOWING_RESULTS')
      }, 1000)
    },
    [hasAnswered, currentQuestion, timeRemaining]
  )

  // Move to next question or finish
  useEffect(() => {
    if (status !== 'SHOWING_RESULTS') return

    const timer = setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        // Next question
        setHasAnswered(false)
        setSelectedAnswer(null)
        setLastAnswerResult(null)
        setCurrentQuestionIndex((prev) => prev + 1)
        setTimeRemaining(gameData?.settings?.timeLimit || 30)
        setStatus('IN_PROGRESS')
      } else {
        // Game finished
        setStatus('FINISHED')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [status, currentQuestionIndex, totalQuestions, gameData])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Error state
  if (error || !gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="p-8 bg-white/10 border-white/20 text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-white mb-2">오류</h2>
          <p className="text-gray-400 mb-6">{error || '게임을 찾을 수 없습니다'}</p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            대시보드로 돌아가기
          </Button>
        </Card>
      </div>
    )
  }

  // No questions
  if (status === 'WAITING' && (!gameData.questions || gameData.questions.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="p-8 bg-white/10 border-white/20 text-center max-w-md">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-white mb-2">퀴즈가 없습니다</h2>
          <p className="text-gray-400 mb-6">이 게임에는 퀴즈 문제가 설정되지 않았습니다.</p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/game/create')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
            >
              새 게임 만들기
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              대시보드로 돌아가기
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Render based on game status
  switch (status) {
    case 'WAITING':
      return (
        <WaitingRoom
          roomCode={roomCode}
          isHost={isHost}
          playerCount={1}
          onStart={handleStartGame}
        />
      )

    case 'COUNTDOWN':
      return <CountdownScreen seconds={countdownSeconds} />

    case 'IN_PROGRESS':
      return currentQuestion ? (
        <QuestionScreen
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          timeRemaining={timeRemaining}
          onAnswer={handleAnswer}
          hasAnswered={hasAnswered}
          selectedAnswer={selectedAnswer}
        />
      ) : null

    case 'SHOWING_RESULTS':
      return lastAnswerResult && currentQuestion ? (
        <ResultsScreen
          isCorrect={lastAnswerResult.isCorrect}
          points={lastAnswerResult.points}
          streak={streak}
          correctAnswer={currentQuestion.answer}
          explanation={currentQuestion.explanation}
        />
      ) : null

    case 'FINISHED':
      return (
        <FinalResultsScreen
          score={score}
          correctCount={correctCount}
          totalQuestions={totalQuestions}
          maxStreak={maxStreak}
        />
      )

    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      )
  }
}
