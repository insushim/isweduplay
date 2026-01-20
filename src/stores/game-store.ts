import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  GameSession,
  GamePlayer,
  Question,
  GameStatus,
  PowerUps,
  LeaderboardEntry,
} from '@/types/game'

interface GameState {
  // Session
  session: GameSession | null
  roomCode: string | null

  // Player
  currentPlayer: GamePlayer | null
  players: GamePlayer[]

  // Game Progress
  status: GameStatus
  currentQuestion: Question | null
  currentQuestionIndex: number
  totalQuestions: number

  // Timer
  timeRemaining: number
  questionStartTime: number | null

  // Score
  score: number
  streak: number
  maxStreak: number
  correctCount: number
  incorrectCount: number

  // Power-ups
  powerUps: PowerUps

  // UI
  soundEnabled: boolean
  musicEnabled: boolean
  showConfetti: boolean
  showCorrectAnswer: boolean

  // Leaderboard
  leaderboard: LeaderboardEntry[]

  // Actions
  setSession: (session: GameSession) => void
  setRoomCode: (code: string) => void
  setCurrentPlayer: (player: GamePlayer) => void
  setPlayers: (players: GamePlayer[]) => void
  updatePlayer: (playerId: string, updates: Partial<GamePlayer>) => void
  addPlayer: (player: GamePlayer) => void
  removePlayer: (playerId: string) => void
  setStatus: (status: GameStatus) => void
  setCurrentQuestion: (question: Question | null, index: number, total: number) => void
  setTimeRemaining: (time: number) => void
  decrementTime: () => void
  submitAnswer: (answer: string, isCorrect: boolean, points: number) => void
  usePowerUp: (type: keyof PowerUps) => boolean
  addPowerUp: (type: keyof PowerUps, count: number) => void
  toggleSound: () => void
  toggleMusic: () => void
  setShowConfetti: (show: boolean) => void
  setShowCorrectAnswer: (show: boolean) => void
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void
  resetGame: () => void
  resetRound: () => void
}

const initialPowerUps: PowerUps = {
  doublePoints: 1,
  extraTime: 1,
  fiftyFifty: 1,
  shield: 1,
  freeze: 0,
}

const initialState = {
  session: null,
  roomCode: null,
  currentPlayer: null,
  players: [],
  status: 'WAITING' as GameStatus,
  currentQuestion: null,
  currentQuestionIndex: 0,
  totalQuestions: 0,
  timeRemaining: 0,
  questionStartTime: null,
  score: 0,
  streak: 0,
  maxStreak: 0,
  correctCount: 0,
  incorrectCount: 0,
  powerUps: initialPowerUps,
  soundEnabled: true,
  musicEnabled: true,
  showConfetti: false,
  showCorrectAnswer: false,
  leaderboard: [],
}

export const useGameStore = create<GameState>()(
  immer((set, get) => ({
    ...initialState,

    setSession: (session) =>
      set((state) => {
        state.session = session
        state.roomCode = session.roomCode
      }),

    setRoomCode: (code) =>
      set((state) => {
        state.roomCode = code
      }),

    setCurrentPlayer: (player) =>
      set((state) => {
        state.currentPlayer = player
        state.score = player.score
        state.streak = player.streak
        state.maxStreak = player.maxStreak
      }),

    setPlayers: (players) =>
      set((state) => {
        state.players = players
      }),

    updatePlayer: (playerId, updates) =>
      set((state) => {
        const index = state.players.findIndex((p) => p.id === playerId)
        if (index !== -1) {
          Object.assign(state.players[index], updates)
        }
        if (state.currentPlayer?.id === playerId) {
          Object.assign(state.currentPlayer, updates)
          if (updates.score !== undefined) state.score = updates.score
          if (updates.streak !== undefined) state.streak = updates.streak
          if (updates.maxStreak !== undefined) state.maxStreak = updates.maxStreak
        }
      }),

    addPlayer: (player) =>
      set((state) => {
        if (!state.players.find((p) => p.id === player.id)) {
          state.players.push(player)
        }
      }),

    removePlayer: (playerId) =>
      set((state) => {
        state.players = state.players.filter((p) => p.id !== playerId)
      }),

    setStatus: (status) =>
      set((state) => {
        state.status = status
      }),

    setCurrentQuestion: (question, index, total) =>
      set((state) => {
        state.currentQuestion = question
        state.currentQuestionIndex = index
        state.totalQuestions = total
        state.questionStartTime = Date.now()
        state.timeRemaining = question?.timeLimit || 30
        state.showCorrectAnswer = false
      }),

    setTimeRemaining: (time) =>
      set((state) => {
        state.timeRemaining = time
      }),

    decrementTime: () =>
      set((state) => {
        if (state.timeRemaining > 0) {
          state.timeRemaining -= 1
        }
      }),

    submitAnswer: (answer, isCorrect, points) =>
      set((state) => {
        if (isCorrect) {
          state.correctCount += 1
          state.streak += 1
          state.maxStreak = Math.max(state.maxStreak, state.streak)
          state.score += points
        } else {
          state.incorrectCount += 1
          state.streak = 0
        }
      }),

    usePowerUp: (type) => {
      const state = get()
      if (state.powerUps[type] > 0) {
        set((s) => {
          s.powerUps[type] -= 1
        })
        return true
      }
      return false
    },

    addPowerUp: (type, count) =>
      set((state) => {
        state.powerUps[type] += count
      }),

    toggleSound: () =>
      set((state) => {
        state.soundEnabled = !state.soundEnabled
      }),

    toggleMusic: () =>
      set((state) => {
        state.musicEnabled = !state.musicEnabled
      }),

    setShowConfetti: (show) =>
      set((state) => {
        state.showConfetti = show
      }),

    setShowCorrectAnswer: (show) =>
      set((state) => {
        state.showCorrectAnswer = show
      }),

    setLeaderboard: (leaderboard) =>
      set((state) => {
        state.leaderboard = leaderboard
      }),

    resetGame: () =>
      set((state) => {
        Object.assign(state, {
          ...initialState,
          soundEnabled: state.soundEnabled,
          musicEnabled: state.musicEnabled,
        })
      }),

    resetRound: () =>
      set((state) => {
        state.currentQuestion = null
        state.timeRemaining = 0
        state.questionStartTime = null
        state.showCorrectAnswer = false
      }),
  }))
)

// Selector hooks for performance
export const useGameSession = () => useGameStore((state) => state.session)
export const useGameStatus = () => useGameStore((state) => state.status)
export const useCurrentQuestion = () => useGameStore((state) => state.currentQuestion)
export const usePlayers = () => useGameStore((state) => state.players)
export const useCurrentPlayer = () => useGameStore((state) => state.currentPlayer)
export const useLeaderboard = () => useGameStore((state) => state.leaderboard)
export const useGameScore = () => useGameStore((state) => ({
  score: state.score,
  streak: state.streak,
  maxStreak: state.maxStreak,
}))
