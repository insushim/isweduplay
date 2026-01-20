'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { GameStatus, Question, GamePlayer, LeaderboardEntry } from '@/types/game'

// Game Components
function WaitingRoom({
  players,
  roomCode,
  isHost,
  onStart,
}: {
  players: GamePlayer[]
  roomCode: string
  isHost: boolean
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
            </div>

            {/* Players List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400">참가자</p>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-0">
                  {players.length}명
                </Badge>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                <AnimatePresence>
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                          player.isHost
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-2 ring-yellow-300'
                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}
                      >
                        {player.avatarUrl || '😊'}
                      </div>
                      <p className="text-white text-sm truncate max-w-full">
                        {player.nickname}
                        {player.isHost && ' 👑'}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Waiting slots */}
                {[...Array(Math.max(0, 5 - players.length))].map((_, i) => (
                  <motion.div
                    key={`empty-${i}`}
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center text-gray-500">
                      ?
                    </div>
                    <p className="text-gray-500 text-sm">대기 중...</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Start Button (Host only) */}
            {isHost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={onStart}
                  disabled={players.length < 1}
                  className="w-full md:w-auto px-12 py-6 text-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                >
                  🚀 게임 시작
                </Button>
                <p className="text-gray-500 text-sm mt-2">
                  {players.length < 1 ? '최소 1명이 필요합니다' : '모든 참가자가 준비되면 시작하세요'}
                </p>
              </motion.div>
            )}

            {!isHost && (
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
                className={`p-6 rounded-xl bg-gradient-to-r ${colors[index]} text-white font-bold text-xl shadow-lg transition-all ${
                  isSelected ? 'ring-4 ring-white' : ''
                } ${isDisabled ? 'opacity-50' : 'hover:shadow-xl'}`}
              >
                <span className="text-3xl mr-3">{icons[index]}</span>
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

function LeaderboardScreen({
  leaderboard,
  currentPlayerId,
}: {
  leaderboard: LeaderboardEntry[]
  currentPlayerId: string
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          🏆 현재 순위
        </h2>

        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((entry, index) => {
            const isMe = entry.playerId === currentPlayerId
            const medals = ['🥇', '🥈', '🥉']

            return (
              <motion.div
                key={entry.playerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  isMe
                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/50'
                    : 'bg-white/5'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${
                    index < 3
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      : 'bg-white/10'
                  }`}
                >
                  {index < 3 ? medals[index] : entry.rank}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isMe ? 'text-purple-300' : 'text-white'}`}>
                    {entry.playerName} {isMe && '(나)'}
                  </p>
                  <p className="text-sm text-gray-400">
                    🔥 {entry.streak}연속 | ✓ {entry.correctCount}개
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{entry.score}</p>
                  <p className="text-xs text-gray-400">포인트</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

function FinalResultsScreen({
  results,
  currentPlayerId,
}: {
  results: LeaderboardEntry[]
  currentPlayerId: string
}) {
  const myResult = results.find((r) => r.playerId === currentPlayerId)
  const myRank = myResult?.rank || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        {/* Winner celebration */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {myRank === 1 ? (
            <>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-[100px]"
              >
                🏆
              </motion.div>
              <h1 className="text-4xl font-bold text-yellow-400">축하합니다!</h1>
              <p className="text-gray-400">1등을 차지했어요!</p>
            </>
          ) : myRank <= 3 ? (
            <>
              <div className="text-[80px]">{myRank === 2 ? '🥈' : '🥉'}</div>
              <h1 className="text-3xl font-bold text-white">잘했어요!</h1>
              <p className="text-gray-400">{myRank}등을 차지했어요!</p>
            </>
          ) : (
            <>
              <div className="text-[80px]">⭐</div>
              <h1 className="text-3xl font-bold text-white">게임 종료!</h1>
              <p className="text-gray-400">{myRank}등을 차지했어요</p>
            </>
          )}
        </motion.div>

        {/* My stats */}
        {myResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{myResult.score}</p>
              <p className="text-sm text-gray-400">총 점수</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{myResult.correctCount}</p>
              <p className="text-sm text-gray-400">정답</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-orange-400">{myResult.streak}</p>
              <p className="text-sm text-gray-400">최대 연속</p>
            </div>
          </motion.div>
        )}

        {/* Final leaderboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">최종 순위</h3>
          <div className="space-y-2">
            {results.map((entry, index) => {
              const isMe = entry.playerId === currentPlayerId
              return (
                <motion.div
                  key={entry.playerId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isMe ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
                    {entry.rank}
                  </div>
                  <p className={`flex-1 ${isMe ? 'text-purple-300' : 'text-white'}`}>
                    {entry.playerName}
                  </p>
                  <p className="font-bold text-white">{entry.score}</p>
                </motion.div>
              )
            })}
          </div>
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
            onClick={() => (window.location.href = '/dashboard')}
            variant="outline"
            className="border-white/20 text-white"
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
  const searchParams = useSearchParams()
  const roomCode = params.roomCode as string
  const nickname = searchParams.get('nickname') || '플레이어'

  const {
    status,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    timeRemaining,
    players,
    leaderboard,
    currentPlayer,
    score,
    streak,
    setStatus,
    setCurrentQuestion,
    setTimeRemaining,
    setPlayers,
    setCurrentPlayer,
    setLeaderboard,
    submitAnswer,
  } = useGameStore()

  const [countdownSeconds, setCountdownSeconds] = useState(3)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean
    points: number
  } | null>(null)

  // Initialize player
  useEffect(() => {
    const player: GamePlayer = {
      id: `player-${Date.now()}`,
      nickname,
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctCount: 0,
      wrongCount: 0,
      coins: 0,
      powerUps: {
        doublePoints: 1,
        extraTime: 1,
        fiftyFifty: 1,
        shield: 1,
        freeze: 0,
      },
      isHost: false,
      isConnected: true,
      isEliminated: false,
    }
    setCurrentPlayer(player)

    // Mock: Add some other players
    setPlayers([
      player,
      {
        ...player,
        id: 'host',
        nickname: '선생님',
        isHost: true,
        avatarUrl: '👨‍🏫',
      },
      { ...player, id: 'p2', nickname: '학생1', avatarUrl: '🦊' },
      { ...player, id: 'p3', nickname: '학생2', avatarUrl: '🐱' },
    ])
  }, [nickname, setCurrentPlayer, setPlayers])

  // Mock game flow for demo
  useEffect(() => {
    // Demo: Start countdown after 3 seconds in waiting
    const waitTimer = setTimeout(() => {
      if (status === 'WAITING') {
        setStatus('COUNTDOWN')
      }
    }, 3000)

    return () => clearTimeout(waitTimer)
  }, [status, setStatus])

  // Countdown timer
  useEffect(() => {
    if (status !== 'COUNTDOWN') return

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setStatus('IN_PROGRESS')
          // Load first question
          setCurrentQuestion(mockQuestion, 0, 5)
          return 3
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, setStatus, setCurrentQuestion])

  // Question timer
  useEffect(() => {
    if (status !== 'IN_PROGRESS' || !currentQuestion) return

    const timer = setInterval(() => {
      setTimeRemaining(timeRemaining - 1)
      if (timeRemaining <= 1) {
        clearInterval(timer)
        // Time's up - show results
        if (!hasAnswered) {
          setLastAnswerResult({ isCorrect: false, points: 0 })
        }
        setStatus('SHOWING_RESULTS')
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [status, currentQuestion, timeRemaining, hasAnswered, setStatus, setTimeRemaining])

  // Handle answer submission
  const handleAnswer = useCallback(
    (answer: string) => {
      if (hasAnswered) return

      setSelectedAnswer(answer)
      setHasAnswered(true)

      const isCorrect = answer === mockQuestion.answer
      const points = isCorrect
        ? Math.floor(100 * (timeRemaining / mockQuestion.timeLimit)) + 50
        : 0

      submitAnswer(answer, isCorrect, points)
      setLastAnswerResult({ isCorrect, points })

      // Show results after a short delay
      setTimeout(() => {
        setStatus('SHOWING_RESULTS')
      }, 1000)
    },
    [hasAnswered, timeRemaining, submitAnswer, setStatus]
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
        setCurrentQuestion(mockQuestion, currentQuestionIndex + 1, totalQuestions)
        setStatus('IN_PROGRESS')
      } else {
        // Game finished
        setLeaderboard([
          {
            playerId: currentPlayer?.id || '',
            playerName: currentPlayer?.nickname || '',
            score,
            rank: 2,
            streak,
            correctCount: 3,
          },
          {
            playerId: 'host',
            playerName: '선생님',
            score: 1500,
            rank: 1,
            streak: 5,
            correctCount: 5,
          },
          {
            playerId: 'p2',
            playerName: '학생1',
            score: 800,
            rank: 3,
            streak: 2,
            correctCount: 3,
          },
        ])
        setStatus('FINISHED')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [
    status,
    currentQuestionIndex,
    totalQuestions,
    currentPlayer,
    score,
    streak,
    setStatus,
    setCurrentQuestion,
    setLeaderboard,
  ])

  // Mock question for demo
  const mockQuestion: Question = {
    id: '1',
    type: 'MULTIPLE_CHOICE',
    content: '대한민국의 수도는 어디인가요?',
    options: ['서울', '부산', '대구', '인천'],
    answer: '서울',
    explanation: '서울은 대한민국의 수도이자 최대 도시입니다.',
    timeLimit: 30,
    points: 100,
    difficulty: 1,
  }

  // Render based on game status
  switch (status) {
    case 'WAITING':
      return (
        <WaitingRoom
          players={players}
          roomCode={roomCode}
          isHost={currentPlayer?.isHost || false}
          onStart={() => setStatus('COUNTDOWN')}
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
      return lastAnswerResult ? (
        <ResultsScreen
          isCorrect={lastAnswerResult.isCorrect}
          points={lastAnswerResult.points}
          streak={streak}
          correctAnswer={mockQuestion.answer}
          explanation={mockQuestion.explanation}
        />
      ) : null

    case 'FINISHED':
      return (
        <FinalResultsScreen
          results={leaderboard}
          currentPlayerId={currentPlayer?.id || ''}
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
