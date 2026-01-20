'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  GameSession,
  GamePlayer,
  Question,
  LeaderboardEntry,
  AnswerResult,
  GameResult,
  QuestionStats,
} from '@/types/game'
import { useGameStore } from '@/stores/game-store'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

interface UseSocketOptions {
  roomCode: string
  playerName: string
  avatar?: string
  onError?: (message: string) => void
}

export function useSocket({ roomCode, playerName, avatar, onError }: UseSocketOptions) {
  const socketRef = useRef<TypedSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isJoined, setIsJoined] = useState(false)

  const {
    setSession,
    setCurrentPlayer,
    setPlayers,
    addPlayer,
    removePlayer,
    updatePlayer,
    setStatus,
    setCurrentQuestion,
    setTimeRemaining,
    setLeaderboard,
    setShowCorrectAnswer,
    submitAnswer: storeSubmitAnswer,
  } = useGameStore()

  // Initialize socket connection
  useEffect(() => {
    const socket: TypedSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
      {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    )

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)

      // Join room after connection
      socket.emit('room:join', { roomCode, playerName, avatar })
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
      setIsJoined(false)
    })

    socket.on('error', ({ message }) => {
      console.error('Socket error:', message)
      onError?.(message)
    })

    // Room events
    socket.on('room:joined', ({ session, player, players }) => {
      console.log('Joined room:', session.roomCode)
      setSession(session)
      setCurrentPlayer(player)
      setPlayers(players)
      setIsJoined(true)
    })

    socket.on('player:joined', ({ player }) => {
      console.log('Player joined:', player.nickname)
      addPlayer(player)
    })

    socket.on('player:left', ({ playerId }) => {
      console.log('Player left:', playerId)
      removePlayer(playerId)
    })

    socket.on('player:disconnected', ({ playerId }) => {
      console.log('Player disconnected:', playerId)
      updatePlayer(playerId, { isConnected: false })
    })

    socket.on('player:reconnected', ({ playerId }) => {
      console.log('Player reconnected:', playerId)
      updatePlayer(playerId, { isConnected: true })
    })

    // Game events
    socket.on('game:countdown', ({ seconds }) => {
      setStatus('COUNTDOWN')
      // Can use this to show countdown UI
    })

    socket.on('game:started', () => {
      console.log('Game started')
      setStatus('IN_PROGRESS')
    })

    socket.on('game:paused', () => {
      console.log('Game paused')
      setStatus('PAUSED')
    })

    socket.on('game:resumed', () => {
      console.log('Game resumed')
      setStatus('IN_PROGRESS')
    })

    // Question events
    socket.on('question:new', ({ question, index, total, timeLimit }) => {
      console.log('New question:', index + 1, '/', total)
      setCurrentQuestion(question, index, total)
      setTimeRemaining(timeLimit)
      setShowCorrectAnswer(false)
    })

    socket.on('question:timeUpdate', ({ remaining }) => {
      setTimeRemaining(remaining)
    })

    socket.on('question:ended', ({ correctAnswer, explanation, stats }) => {
      console.log('Question ended, answer:', correctAnswer)
      setStatus('SHOWING_RESULTS')
      setShowCorrectAnswer(true)
    })

    // Answer events
    socket.on('answer:result', (result: AnswerResult) => {
      console.log('Answer result:', result.isCorrect ? 'Correct!' : 'Wrong')
      storeSubmitAnswer(result.answer, result.isCorrect, result.pointsEarned)
    })

    socket.on('player:scored', ({ playerId, points, streak, newScore }) => {
      updatePlayer(playerId, { score: newScore, streak })
    })

    // Leaderboard events
    socket.on('leaderboard:update', ({ players }) => {
      setLeaderboard(players)
    })

    // Game finished
    socket.on('game:finished', ({ results, rankings }) => {
      console.log('Game finished!')
      setStatus('FINISHED')
      setLeaderboard(rankings)
    })

    // Power-up events
    socket.on('powerup:activated', ({ type, playerId }) => {
      console.log(`Power-up ${type} activated by ${playerId}`)
    })

    // Connect
    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [roomCode, playerName, avatar])

  // Actions
  const startGame = useCallback(() => {
    socketRef.current?.emit('game:start', {})
  }, [])

  const pauseGame = useCallback(() => {
    socketRef.current?.emit('game:pause', {})
  }, [])

  const resumeGame = useCallback(() => {
    socketRef.current?.emit('game:resume', {})
  }, [])

  const submitAnswer = useCallback(
    (questionId: string, answer: string, responseTime: number) => {
      socketRef.current?.emit('answer:submit', {
        questionId,
        answer,
        responseTime,
      })
    },
    []
  )

  const usePowerUp = useCallback((type: string) => {
    socketRef.current?.emit('powerup:use', { type })
  }, [])

  const sendChatMessage = useCallback((message: string) => {
    socketRef.current?.emit('chat:message', { message })
  }, [])

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('room:leave', {})
  }, [])

  return {
    isConnected,
    isJoined,
    socket: socketRef.current,
    actions: {
      startGame,
      pauseGame,
      resumeGame,
      submitAnswer,
      usePowerUp,
      sendChatMessage,
      leaveRoom,
    },
  }
}
