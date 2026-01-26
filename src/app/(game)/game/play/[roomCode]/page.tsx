'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { GameStatus, Question, GamePlayer, LeaderboardEntry } from '@/types/game'

// 게임별 전용 컴포넌트 import
import dynamic from 'next/dynamic'

const EscapeRoomGame = dynamic(() => import('@/components/games/EscapeRoomGame'), { ssr: false })
const MemoryMatchGame = dynamic(() => import('@/components/games/MemoryMatchGame'), { ssr: false })
const BingoGame = dynamic(() => import('@/components/games/BingoGame'), { ssr: false })
const WordHuntGame = dynamic(() => import('@/components/games/WordHuntGame'), { ssr: false })
const SurvivalGame = dynamic(() => import('@/components/games/SurvivalGame'), { ssr: false })
const SpeedRaceGame = dynamic(() => import('@/components/games/SpeedRaceGame'), { ssr: false })
const TowerDefenseGame = dynamic(() => import('@/components/games/TowerDefenseGame'), { ssr: false })
const PuzzleQuestGame = dynamic(() => import('@/components/games/PuzzleQuestGame'), { ssr: false })
const MathRunnerGame = dynamic(() => import('@/components/games/MathRunnerGame'), { ssr: false })
const WordChainGame = dynamic(() => import('@/components/games/WordChainGame'), { ssr: false })
const JeopardyGame = dynamic(() => import('@/components/games/JeopardyGame'), { ssr: false })
const WheelFortuneGame = dynamic(() => import('@/components/games/WheelFortuneGame'), { ssr: false })
const TeamBattleGame = dynamic(() => import('@/components/games/TeamBattleGame'), { ssr: false })
const FlashCardsGame = dynamic(() => import('@/components/games/FlashCardsGame'), { ssr: false })
const MatchingPairsGame = dynamic(() => import('@/components/games/MatchingPairsGame'), { ssr: false })
const FillBlanksGame = dynamic(() => import('@/components/games/FillBlanksGame'), { ssr: false })
const TimeAttackGame = dynamic(() => import('@/components/games/TimeAttackGame'), { ssr: false })

// 외부 QuestionAnswer 컴포넌트 import
import QuestionAnswer from '@/components/games/QuestionAnswer'

// 럭키 스핀 이벤트 타입
interface LuckyEvent {
  id: string
  name: string
  icon: string
  description: string
  effect: 'double_points' | 'steal_points' | 'shield' | 'time_freeze' | 'bonus_streak' | 'mystery_box'
  rarity: 'common' | 'rare' | 'legendary'
  color: string
}

// 럭키 이벤트 목록
const LUCKY_EVENTS: LuckyEvent[] = [
  {
    id: 'double_points',
    name: '더블 찬스!',
    icon: '✨',
    description: '이번 문제 점수 2배!',
    effect: 'double_points',
    rarity: 'common',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'steal_10',
    name: '포인트 스틸!',
    icon: '🦊',
    description: '랜덤 상대에게서 50점 훔치기!',
    effect: 'steal_points',
    rarity: 'rare',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'shield',
    name: '보호막!',
    icon: '🛡️',
    description: '틀려도 점수 유지!',
    effect: 'shield',
    rarity: 'rare',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'time_freeze',
    name: '시간 정지!',
    icon: '⏰',
    description: '5초 추가 시간!',
    effect: 'time_freeze',
    rarity: 'common',
    color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'bonus_streak',
    name: '연속 보너스!',
    icon: '🔥',
    description: '연속 정답 +2 추가!',
    effect: 'bonus_streak',
    rarity: 'rare',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'mystery_box',
    name: '미스터리 박스!',
    icon: '🎁',
    description: '랜덤 보너스 점수! (10~200점)',
    effect: 'mystery_box',
    rarity: 'legendary',
    color: 'from-pink-500 to-purple-600'
  }
]

// 럭키 스핀 컴포넌트
function LuckySpinWheel({
  isSpinning,
  selectedEvent,
  onSpinComplete,
}: {
  isSpinning: boolean
  selectedEvent: LuckyEvent | null
  onSpinComplete: () => void
}) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (isSpinning && selectedEvent) {
      const eventIndex = LUCKY_EVENTS.findIndex(e => e.id === selectedEvent.id)
      const segmentAngle = 360 / LUCKY_EVENTS.length
      const targetAngle = 360 * 5 + (eventIndex * segmentAngle) + segmentAngle / 2
      setRotation(targetAngle)

      const timer = setTimeout(onSpinComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSpinning, selectedEvent, onSpinComplete])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-6">🎰 럭키 스핀!</h2>

        {/* 스핀 휠 */}
        <div className="relative w-64 h-64 mx-auto mb-6">
          <motion.div
            className="w-full h-full rounded-full border-8 border-white/30 overflow-hidden relative"
            style={{
              background: 'conic-gradient(from 0deg, #f59e0b, #8b5cf6, #06b6d4, #ef4444, #22c55e, #ec4899)'
            }}
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {LUCKY_EVENTS.map((event, index) => (
              <div
                key={event.id}
                className="absolute text-2xl"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${index * (360 / LUCKY_EVENTS.length)}deg) translateY(-80px)`,
                }}
              >
                {event.icon}
              </div>
            ))}
          </motion.div>

          {/* 포인터 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-4xl">
            ▼
          </div>
        </div>

        {/* 결과 표시 */}
        <AnimatePresence>
          {selectedEvent && !isSpinning && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className={`p-6 rounded-2xl bg-gradient-to-r ${selectedEvent.color}`}
            >
              <div className="text-6xl mb-2">{selectedEvent.icon}</div>
              <h3 className="text-2xl font-bold text-white">{selectedEvent.name}</h3>
              <p className="text-white/80">{selectedEvent.description}</p>
              <Badge className={`mt-2 ${
                selectedEvent.rarity === 'legendary' ? 'bg-yellow-500' :
                selectedEvent.rarity === 'rare' ? 'bg-purple-500' : 'bg-gray-500'
              }`}>
                {selectedEvent.rarity === 'legendary' ? '전설' :
                 selectedEvent.rarity === 'rare' ? '레어' : '일반'}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// 활성 이벤트 표시 컴포넌트
function ActiveEventBadge({ event }: { event: LuckyEvent }) {
  return (
    <motion.div
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: -20 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-full bg-gradient-to-r ${event.color} shadow-lg`}
    >
      <div className="flex items-center gap-2 text-white font-bold">
        <span className="text-2xl animate-bounce">{event.icon}</span>
        <span>{event.name}</span>
        <span className="text-sm opacity-80">활성화!</span>
      </div>
    </motion.div>
  )
}

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

// 실시간 순위 컴포넌트
function LiveLeaderboard({
  players,
  currentPlayerId,
  isCompact = false,
}: {
  players: Array<{ id: string; name: string; score: number; avatar?: string }>
  currentPlayerId: string
  isCompact?: boolean
}) {
  // 점수순 정렬
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const myRank = sortedPlayers.findIndex(p => p.id === currentPlayerId) + 1

  const rankEmojis = ['🥇', '🥈', '🥉']

  if (isCompact) {
    // 컴팩트 모드: 상위 3명 + 내 순위만 표시
    const top3 = sortedPlayers.slice(0, 3)
    const myPlayer = sortedPlayers.find(p => p.id === currentPlayerId)

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed right-4 top-20 w-48 bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
          <span className="text-lg">🏆</span>
          <span className="text-sm font-semibold text-white">실시간 순위</span>
        </div>

        <div className="space-y-1.5">
          {top3.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-2 p-1.5 rounded-lg ${
                player.id === currentPlayerId
                  ? 'bg-yellow-500/20 border border-yellow-500/30'
                  : ''
              }`}
            >
              <span className="text-sm w-5">{rankEmojis[index] || `${index + 1}`}</span>
              <span className={`text-xs flex-1 truncate ${
                player.id === currentPlayerId ? 'text-yellow-300 font-bold' : 'text-white/80'
              }`}>
                {player.name}
              </span>
              <span className="text-xs font-bold text-white">{player.score}</span>
            </motion.div>
          ))}

          {/* 내가 상위 3명에 없으면 구분선 후 표시 */}
          {myRank > 3 && myPlayer && (
            <>
              <div className="flex items-center gap-1 py-1 text-white/40">
                <span className="flex-1 h-px bg-white/20"></span>
                <span className="text-xs">...</span>
                <span className="flex-1 h-px bg-white/20"></span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                <span className="text-xs w-5 text-white/60">{myRank}</span>
                <span className="text-xs flex-1 truncate text-yellow-300 font-bold">
                  {myPlayer.name}
                </span>
                <span className="text-xs font-bold text-white">{myPlayer.score}</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        🏆 실시간 순위
      </h3>
      <div className="space-y-2">
        {sortedPlayers.slice(0, 10).map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              player.id === currentPlayerId
                ? 'bg-yellow-500/20 border border-yellow-500/30'
                : 'bg-white/5'
            }`}
          >
            <span className="text-lg w-8 text-center">
              {index < 3 ? rankEmojis[index] : `${index + 1}`}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
              {player.avatar || player.name.charAt(0).toUpperCase()}
            </div>
            <span className={`flex-1 truncate ${
              player.id === currentPlayerId ? 'text-yellow-300 font-bold' : 'text-white'
            }`}>
              {player.name}
            </span>
            <span className="font-bold text-white">{player.score} pt</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// 게임 타입별 테마/배경 설정 (18가지 전부)
const GAME_THEMES: Record<string, { bg: string; accent: string; icon: string; title: string }> = {
  QUIZ_BATTLE: {
    bg: 'from-purple-900 via-indigo-900 to-purple-900',
    accent: 'from-purple-500 to-pink-500',
    icon: '⚔️',
    title: '퀴즈 배틀'
  },
  SPEED_RACE: {
    bg: 'from-blue-900 via-cyan-900 to-blue-900',
    accent: 'from-cyan-400 to-blue-500',
    icon: '🚀',
    title: '스피드 레이스'
  },
  SURVIVAL: {
    bg: 'from-red-900 via-black to-red-900',
    accent: 'from-red-500 to-pink-600',
    icon: '💀',
    title: '서바이벌'
  },
  TEAM_BATTLE: {
    bg: 'from-green-900 via-emerald-900 to-green-900',
    accent: 'from-green-400 to-teal-500',
    icon: '👥',
    title: '팀 대전'
  },
  TOWER_DEFENSE: {
    bg: 'from-amber-900 via-orange-900 to-amber-900',
    accent: 'from-yellow-400 to-orange-500',
    icon: '🏰',
    title: '타워 디펜스'
  },
  MEMORY_MATCH: {
    bg: 'from-pink-900 via-rose-900 to-pink-900',
    accent: 'from-pink-400 to-rose-500',
    icon: '🧠',
    title: '기억력 게임'
  },
  WORD_HUNT: {
    bg: 'from-indigo-900 via-violet-900 to-indigo-900',
    accent: 'from-indigo-400 to-violet-500',
    icon: '🔍',
    title: '단어 찾기'
  },
  BINGO: {
    bg: 'from-teal-900 via-cyan-900 to-teal-900',
    accent: 'from-teal-400 to-cyan-500',
    icon: '🎯',
    title: '빙고'
  },
  ESCAPE_ROOM: {
    bg: 'from-gray-900 via-slate-800 to-gray-900',
    accent: 'from-amber-500 to-orange-600',
    icon: '🚪',
    title: '방탈출'
  },
  PUZZLE_QUEST: {
    bg: 'from-emerald-900 via-green-900 to-emerald-900',
    accent: 'from-emerald-400 to-green-500',
    icon: '🧩',
    title: '퍼즐 퀘스트'
  },
  MATH_RUNNER: {
    bg: 'from-orange-900 via-amber-900 to-orange-900',
    accent: 'from-orange-400 to-red-500',
    icon: '🏃',
    title: '수학 러너'
  },
  WORD_CHAIN: {
    bg: 'from-lime-900 via-green-900 to-lime-900',
    accent: 'from-lime-400 to-green-500',
    icon: '🔗',
    title: '끝말잇기'
  },
  JEOPARDY: {
    bg: 'from-blue-900 via-indigo-900 to-blue-900',
    accent: 'from-blue-500 to-indigo-600',
    icon: '📺',
    title: '제퍼디'
  },
  WHEEL_FORTUNE: {
    bg: 'from-purple-900 via-fuchsia-900 to-purple-900',
    accent: 'from-purple-400 to-fuchsia-500',
    icon: '🎡',
    title: '행운의 바퀴'
  },
  FLASH_CARDS: {
    bg: 'from-teal-900 via-cyan-900 to-teal-900',
    accent: 'from-teal-400 to-cyan-500',
    icon: '📇',
    title: '플래시 카드'
  },
  MATCHING_PAIRS: {
    bg: 'from-rose-900 via-pink-900 to-rose-900',
    accent: 'from-rose-400 to-pink-500',
    icon: '🎴',
    title: '짝 맞추기'
  },
  FILL_THE_BLANKS: {
    bg: 'from-slate-900 via-gray-800 to-slate-900',
    accent: 'from-slate-400 to-gray-500',
    icon: '✏️',
    title: '빈칸 채우기'
  },
  TIME_ATTACK: {
    bg: 'from-red-900 via-orange-900 to-red-900',
    accent: 'from-red-500 to-orange-500',
    icon: '⏱️',
    title: '타임 어택'
  }
}

function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  timeRemaining,
  onAnswer,
  hasAnswered,
  selectedAnswer,
  players,
  currentPlayerId,
  currentScore,
  gameType,
  lives,
  puzzleProgress,
}: {
  question: Question
  questionIndex: number
  totalQuestions: number
  timeRemaining: number
  onAnswer: (answer: string) => void
  hasAnswered: boolean
  selectedAnswer: string | null
  players?: Array<{ id: string; name: string; score: number; avatar?: string }>
  currentPlayerId?: string
  currentScore?: number
  gameType?: string
  lives?: number
  puzzleProgress?: number
}) {
  const theme = GAME_THEMES[gameType || 'QUIZ_BATTLE'] || GAME_THEMES.QUIZ_BATTLE

  // 현재 플레이어 정보
  const allPlayers = players && players.length > 0
    ? players.map(p => p.id === currentPlayerId ? { ...p, score: currentScore ?? p.score } : p)
    : currentPlayerId
      ? [{ id: currentPlayerId, name: '나', score: currentScore ?? 0 }]
      : []

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-4`}>
      {/* 게임 타입 표시 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-4 left-4 px-4 py-2 rounded-full bg-gradient-to-r ${theme.accent} text-white font-bold shadow-lg z-30`}
      >
        <span className="mr-2">{theme.icon}</span>
        {theme.title}
      </motion.div>

      {/* 서바이벌 모드: 목숨 표시 */}
      {gameType === 'SURVIVAL' && lives !== undefined && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 flex gap-1 z-30"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-3xl ${i < lives ? '' : 'opacity-30'}`}>
              ❤️
            </span>
          ))}
        </motion.div>
      )}

      {/* 방탈출: 진행도 표시 */}
      {gameType === 'ESCAPE_ROOM' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-16 left-4 right-4 z-20"
        >
          <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
            <span>🔓 탈출 진행도</span>
            <span>{puzzleProgress || questionIndex + 1} / {totalQuestions}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${((puzzleProgress || questionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* 실시간 순위 */}
      {allPlayers.length > 0 && currentPlayerId && gameType !== 'ESCAPE_ROOM' && (
        <LiveLeaderboard
          players={allPlayers}
          currentPlayerId={currentPlayerId}
          isCompact={true}
        />
      )}

      <div className={`max-w-4xl mx-auto space-y-6 ${gameType === 'ESCAPE_ROOM' ? 'pt-20' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge className="bg-white/10 text-white border-0">
            {gameType === 'ESCAPE_ROOM' ? `퍼즐 ${questionIndex + 1}` : `문제 ${questionIndex + 1}`} / {totalQuestions}
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

        {/* 힌트 표시 (방탈출) */}
        {gameType === 'ESCAPE_ROOM' && question.hint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4"
          >
            <p className="text-amber-300 text-sm">💡 힌트: {question.hint}</p>
          </motion.div>
        )}

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm rounded-2xl p-6 md:p-8 ${
            gameType === 'ESCAPE_ROOM'
              ? 'bg-black/50 border-2 border-amber-500/30'
              : 'bg-white/10'
          }`}
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
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center leading-relaxed"
              style={{ wordBreak: 'keep-all', lineHeight: '1.8' }}
          >
            {question.content}
          </h2>
        </motion.div>

        {/* 문제 유형에 따른 입력 */}
        <QuestionAnswer
          question={question}
          onAnswer={onAnswer}
          disabled={hasAnswered}
        />

        {/* 답변 완료 표시 */}
        {hasAnswered && question.type === 'MULTIPLE_CHOICE' && (
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
  bonusPoints,
  eventApplied,
  stolenPoints,
  mysteryBonus,
}: {
  isCorrect: boolean
  points: number
  streak: number
  correctAnswer: string
  explanation?: string
  bonusPoints?: number
  eventApplied?: string
  stolenPoints?: number
  mysteryBonus?: number
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
          {isCorrect ? '🎉' : eventApplied ? '🛡️' : '😢'}
        </motion.div>

        <h2
          className={`text-4xl font-bold ${
            isCorrect ? 'text-green-400' : eventApplied ? 'text-blue-400' : 'text-red-400'
          }`}
        >
          {isCorrect ? '정답!' : eventApplied ? eventApplied : '틀렸어요'}
        </h2>

        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <p className="text-3xl font-bold text-yellow-400">+{points} 포인트</p>
            {bonusPoints && bonusPoints > 0 && (
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.3, 1] }}
                className="text-2xl text-pink-400"
              >
                ✨ 보너스 +{bonusPoints}!
              </motion.p>
            )}
            {streak > 1 && (
              <p className="text-orange-400">🔥 {streak}연속 정답!</p>
            )}
          </motion.div>
        )}

        {/* 럭키 이벤트 보너스 표시 */}
        {stolenPoints && stolenPoints > 0 && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-purple-500/20 rounded-xl p-4 max-w-md mx-auto"
          >
            <p className="text-2xl text-purple-400">🦊 +{stolenPoints}점 훔치기 성공!</p>
          </motion.div>
        )}

        {mysteryBonus && mysteryBonus > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
            className="bg-pink-500/20 rounded-xl p-4 max-w-md mx-auto"
          >
            <p className="text-2xl text-pink-400">🎁 미스터리 보너스 +{mysteryBonus}점!</p>
          </motion.div>
        )}

        {!isCorrect && !eventApplied && (
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
    bonusPoints?: number
    eventApplied?: string
  } | null>(null)

  // 게임 통계
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  // 럭키 스핀 관련 상태
  const [showLuckySpin, setShowLuckySpin] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedLuckyEvent, setSelectedLuckyEvent] = useState<LuckyEvent | null>(null)
  const [activeEvent, setActiveEvent] = useState<LuckyEvent | null>(null)
  const [luckySpinAvailable, setLuckySpinAvailable] = useState(false)
  const [stolenPoints, setStolenPoints] = useState(0)
  const [mysteryBonus, setMysteryBonus] = useState(0)
  const lastLuckySpinQuestion = useRef(-1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 럭키 스핀 발동 체크 (매 문제마다 50% 확률)
  const checkLuckySpin = useCallback((questionIndex: number) => {
    if (questionIndex > 0 && lastLuckySpinQuestion.current !== questionIndex) {
      const chance = Math.random()
      if (chance < 0.5) { // 50% 확률
        lastLuckySpinQuestion.current = questionIndex
        return true
      }
    }
    return false
  }, [])

  // 럭키 이벤트 선택 (확률 가중치 적용)
  const selectRandomEvent = useCallback(() => {
    const weights = LUCKY_EVENTS.map(e =>
      e.rarity === 'legendary' ? 5 : e.rarity === 'rare' ? 20 : 40
    )
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight

    for (let i = 0; i < LUCKY_EVENTS.length; i++) {
      random -= weights[i]
      if (random <= 0) return LUCKY_EVENTS[i]
    }
    return LUCKY_EVENTS[0]
  }, [])

  // 럭키 스핀 시작
  const startLuckySpin = useCallback(() => {
    const event = selectRandomEvent()
    setSelectedLuckyEvent(event)
    setShowLuckySpin(true)
    setIsSpinning(true)
  }, [selectRandomEvent])

  // 스핀 완료 처리
  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false)

    setTimeout(() => {
      if (selectedLuckyEvent) {
        setActiveEvent(selectedLuckyEvent)

        // 즉시 효과 적용
        if (selectedLuckyEvent.effect === 'steal_points') {
          const stolen = 50
          setStolenPoints(stolen)
          setScore(prev => prev + stolen)
        } else if (selectedLuckyEvent.effect === 'mystery_box') {
          const bonus = Math.floor(Math.random() * 191) + 10 // 10~200
          setMysteryBonus(bonus)
          setScore(prev => prev + bonus)
        } else if (selectedLuckyEvent.effect === 'bonus_streak') {
          setStreak(prev => prev + 2)
        } else if (selectedLuckyEvent.effect === 'time_freeze') {
          setTimeRemaining(prev => prev + 5)
        }
      }
      setShowLuckySpin(false)
      setLuckySpinAvailable(false)
    }, 2000)
  }, [selectedLuckyEvent])

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
      let basePoints = isCorrect
        ? Math.floor(100 * (timeRemaining / timeLimit)) + 50
        : 0

      let bonusPoints = 0
      let eventApplied = ''

      // 럭키 이벤트 효과 적용
      if (activeEvent) {
        if (activeEvent.effect === 'double_points' && isCorrect) {
          bonusPoints = basePoints // 2배
          eventApplied = '더블 찬스! x2'
        } else if (activeEvent.effect === 'shield' && !isCorrect) {
          // 보호막: 틀려도 점수 0 대신 유지
          basePoints = 0
          eventApplied = '보호막 발동!'
        }
      }

      const totalPoints = basePoints + bonusPoints

      if (isCorrect) {
        setScore((prev) => prev + totalPoints)
        setCorrectCount((prev) => prev + 1)
        setStreak((prev) => {
          const newStreak = prev + 1
          setMaxStreak((max) => Math.max(max, newStreak))
          return newStreak
        })
      } else {
        // 보호막 효과가 없으면 streak 리셋
        if (activeEvent?.effect !== 'shield') {
          setStreak(0)
        }
      }

      setLastAnswerResult({
        isCorrect,
        points: totalPoints,
        bonusPoints: bonusPoints > 0 ? bonusPoints : undefined,
        eventApplied: eventApplied || undefined
      })

      // 이벤트 효과 소진
      if (activeEvent?.effect === 'double_points' || activeEvent?.effect === 'shield') {
        setActiveEvent(null)
      }

      // Show results after a short delay
      setTimeout(() => {
        setStatus('SHOWING_RESULTS')
      }, 1000)
    },
    [hasAnswered, currentQuestion, timeRemaining, activeEvent]
  )

  // Move to next question or finish
  useEffect(() => {
    if (status !== 'SHOWING_RESULTS') return

    const timer = setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        const nextQuestionIndex = currentQuestionIndex + 1

        // 럭키 스핀 체크
        if (checkLuckySpin(nextQuestionIndex)) {
          setLuckySpinAvailable(true)
          // 잠시 후 럭키 스핀 시작
          setTimeout(() => {
            startLuckySpin()
          }, 500)
        }

        // Next question
        setHasAnswered(false)
        setSelectedAnswer(null)
        setLastAnswerResult(null)
        setCurrentQuestionIndex(nextQuestionIndex)
        setTimeRemaining(gameData?.settings?.timeLimit || 30)
        setStatus('IN_PROGRESS')
      } else {
        // Game finished
        setStatus('FINISHED')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [status, currentQuestionIndex, totalQuestions, gameData, checkLuckySpin, startLuckySpin])

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

  // 전용 게임 컴포넌트 사용하는 게임 유형들
  const specializedGameTypes = [
    'ESCAPE_ROOM', 'MEMORY_MATCH', 'BINGO', 'WORD_HUNT', 'SURVIVAL',
    'SPEED_RACE', 'TOWER_DEFENSE', 'PUZZLE_QUEST', 'MATH_RUNNER',
    'WORD_CHAIN', 'JEOPARDY', 'WHEEL_FORTUNE', 'TEAM_BATTLE',
    'FLASH_CARDS', 'MATCHING_PAIRS', 'FILL_THE_BLANKS', 'TIME_ATTACK'
  ]

  // 전용 게임 완료 핸들러
  const handleSpecializedGameComplete = useCallback((finalScore: number, finalCorrectCount: number) => {
    setScore(finalScore)
    setCorrectCount(finalCorrectCount)
    setStatus('FINISHED')
  }, [])

  // 게임 타입별 props
  const gameTimeLimit = gameData?.settings?.timeLimit || 30
  const gameQuestions = gameData?.questions || []
  const gameType = gameData?.gameType || ''

  // 전용 게임 렌더링 여부
  const isSpecializedGame = specializedGameTypes.includes(gameType) && status === 'IN_PROGRESS'

  // 전용 게임 컴포넌트 렌더링 - switch 문 밖에서 조건부 렌더링
  if (isSpecializedGame && gameQuestions.length > 0) {
    switch (gameType) {
      case 'ESCAPE_ROOM':
        return <EscapeRoomGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'MEMORY_MATCH':
        return <MemoryMatchGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'BINGO':
        return <BingoGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'WORD_HUNT':
        return <WordHuntGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'SURVIVAL':
        return <SurvivalGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'SPEED_RACE':
        return <SpeedRaceGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'TOWER_DEFENSE':
        return <TowerDefenseGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'PUZZLE_QUEST':
        return <PuzzleQuestGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'MATH_RUNNER':
        return <MathRunnerGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'WORD_CHAIN':
        return <WordChainGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'JEOPARDY':
        return <JeopardyGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'WHEEL_FORTUNE':
        return <WheelFortuneGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'TEAM_BATTLE':
        return <TeamBattleGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'FLASH_CARDS':
        return <FlashCardsGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'MATCHING_PAIRS':
        return <MatchingPairsGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'FILL_THE_BLANKS':
        return <FillBlanksGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
      case 'TIME_ATTACK':
        return <TimeAttackGame questions={gameQuestions} onComplete={handleSpecializedGameComplete} timeLimit={gameTimeLimit} />
    }
  }

  // Render based on game status
  if (status === 'WAITING') {
    return (
      <WaitingRoom
        roomCode={roomCode}
        isHost={isHost}
        playerCount={1}
        onStart={handleStartGame}
      />
    )
  }

  if (status === 'COUNTDOWN') {
    return <CountdownScreen seconds={countdownSeconds} />
  }

  if (status === 'IN_PROGRESS' && currentQuestion) {
    return (
      <>
        {/* 럭키 스핀 모달 */}
        {showLuckySpin && (
          <LuckySpinWheel
            isSpinning={isSpinning}
            selectedEvent={selectedLuckyEvent}
            onSpinComplete={handleSpinComplete}
          />
        )}

        {/* 활성 이벤트 배지 */}
        <AnimatePresence>
          {activeEvent && <ActiveEventBadge event={activeEvent} />}
        </AnimatePresence>

        <QuestionScreen
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          timeRemaining={timeRemaining}
          onAnswer={handleAnswer}
          hasAnswered={hasAnswered}
          selectedAnswer={selectedAnswer}
          players={[
            { id: session?.user?.id || 'me', name: session?.user?.name || '나', score: score }
          ]}
          currentPlayerId={session?.user?.id || 'me'}
          currentScore={score}
          gameType={gameData?.gameType}
        />
      </>
    )
  }

  if (status === 'SHOWING_RESULTS' && lastAnswerResult && currentQuestion) {
    return (
      <ResultsScreen
        isCorrect={lastAnswerResult.isCorrect}
        points={lastAnswerResult.points}
        streak={streak}
        correctAnswer={currentQuestion.answer}
        explanation={currentQuestion.explanation}
        bonusPoints={lastAnswerResult.bonusPoints}
        eventApplied={lastAnswerResult.eventApplied}
        stolenPoints={stolenPoints > 0 ? stolenPoints : undefined}
        mysteryBonus={mysteryBonus > 0 ? mysteryBonus : undefined}
      />
    )
  }

  if (status === 'FINISHED') {
    return (
      <FinalResultsScreen
        score={score}
        correctCount={correctCount}
        totalQuestions={totalQuestions}
        maxStreak={maxStreak}
      />
    )
  }

  // default loading
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
