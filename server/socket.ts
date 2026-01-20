import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  GameSession,
  GamePlayer,
  Question,
  LeaderboardEntry,
} from '../src/types/game'

interface Room {
  session: GameSession
  players: Map<string, GamePlayer>
  questions: Question[]
  currentQuestionIndex: number
  questionTimer: NodeJS.Timeout | null
  answerResults: Map<string, { answer: string; responseTime: number }>
}

const rooms = new Map<string, Room>()

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id)

    // Join room
    socket.on('room:join', ({ roomCode, playerName, avatar }) => {
      const room = rooms.get(roomCode)

      if (!room) {
        socket.emit('error', { message: '방을 찾을 수 없습니다.' })
        return
      }

      if (room.session.status !== 'WAITING') {
        socket.emit('error', { message: '이미 시작된 게임입니다.' })
        return
      }

      if (room.players.size >= room.session.maxPlayers) {
        socket.emit('error', { message: '방이 가득 찼습니다.' })
        return
      }

      // Create player
      const player: GamePlayer = {
        id: socket.id,
        oderId: socket.id,
        nickname: playerName,
        avatarUrl: avatar,
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
        isHost: room.players.size === 0,
        isConnected: true,
        isEliminated: false,
      }

      room.players.set(socket.id, player)
      socket.join(roomCode)

      // Notify player
      socket.emit('room:joined', {
        session: room.session,
        player,
        players: Array.from(room.players.values()),
      })

      // Notify others
      socket.to(roomCode).emit('player:joined', { player })
    })

    // Leave room
    socket.on('room:leave', () => {
      handleDisconnect(socket)
    })

    // Start game (host only)
    socket.on('game:start', () => {
      const roomCode = findPlayerRoom(socket.id)
      if (!roomCode) return

      const room = rooms.get(roomCode)
      if (!room) return

      const player = room.players.get(socket.id)
      if (!player?.isHost) {
        socket.emit('error', { message: '호스트만 게임을 시작할 수 있습니다.' })
        return
      }

      if (room.players.size < 1) {
        socket.emit('error', { message: '최소 1명의 플레이어가 필요합니다.' })
        return
      }

      // Start countdown
      room.session.status = 'COUNTDOWN'
      let countdown = 3

      const countdownInterval = setInterval(() => {
        io.to(roomCode).emit('game:countdown', { seconds: countdown })
        countdown--

        if (countdown < 0) {
          clearInterval(countdownInterval)
          startGame(io, roomCode, room)
        }
      }, 1000)
    })

    // Pause game
    socket.on('game:pause', () => {
      const roomCode = findPlayerRoom(socket.id)
      if (!roomCode) return

      const room = rooms.get(roomCode)
      if (!room) return

      const player = room.players.get(socket.id)
      if (!player?.isHost) return

      room.session.status = 'PAUSED'
      if (room.questionTimer) {
        clearTimeout(room.questionTimer)
      }

      io.to(roomCode).emit('game:paused')
    })

    // Resume game
    socket.on('game:resume', () => {
      const roomCode = findPlayerRoom(socket.id)
      if (!roomCode) return

      const room = rooms.get(roomCode)
      if (!room) return

      const player = room.players.get(socket.id)
      if (!player?.isHost) return

      room.session.status = 'IN_PROGRESS'
      io.to(roomCode).emit('game:resumed')
    })

    // Submit answer
    socket.on('answer:submit', ({ questionId, answer, responseTime }) => {
      const roomCode = findPlayerRoom(socket.id)
      if (!roomCode) return

      const room = rooms.get(roomCode)
      if (!room || room.session.status !== 'IN_PROGRESS') return

      const player = room.players.get(socket.id)
      if (!player || player.isEliminated) return

      const currentQuestion = room.questions[room.currentQuestionIndex]
      if (!currentQuestion || currentQuestion.id !== questionId) return

      // Check if already answered
      if (room.answerResults.has(socket.id)) return

      // Store answer
      room.answerResults.set(socket.id, { answer, responseTime })

      // Calculate score
      const isCorrect = answer === currentQuestion.answer
      const timeBonus = Math.floor((1 - responseTime / currentQuestion.timeLimit) * 50)
      const basePoints = currentQuestion.points
      let pointsEarned = isCorrect ? basePoints + timeBonus : 0

      // Streak bonus
      if (isCorrect) {
        player.streak++
        player.correctCount++
        if (player.streak > 1) {
          pointsEarned += Math.floor(pointsEarned * 0.1 * Math.min(player.streak - 1, 5))
        }
        player.maxStreak = Math.max(player.maxStreak, player.streak)
      } else {
        player.streak = 0
        player.wrongCount++
      }

      player.score += pointsEarned
      room.players.set(socket.id, player)

      // Send result to player
      socket.emit('answer:result', {
        playerId: socket.id,
        questionId,
        answer,
        isCorrect,
        responseTime,
        pointsEarned,
        bonusPoints: isCorrect ? timeBonus : 0,
        newScore: player.score,
        newStreak: player.streak,
      })

      // Notify others of score update
      io.to(roomCode).emit('player:scored', {
        playerId: socket.id,
        points: pointsEarned,
        streak: player.streak,
        newScore: player.score,
      })

      // Check if all players answered
      if (room.answerResults.size >= room.players.size) {
        if (room.questionTimer) {
          clearTimeout(room.questionTimer)
        }
        endQuestion(io, roomCode, room)
      }
    })

    // Use power-up
    socket.on('powerup:use', ({ type }) => {
      const roomCode = findPlayerRoom(socket.id)
      if (!roomCode) return

      const room = rooms.get(roomCode)
      if (!room) return

      const player = room.players.get(socket.id)
      if (!player) return

      const powerUpKey = type as keyof typeof player.powerUps
      if (player.powerUps[powerUpKey] <= 0) {
        socket.emit('error', { message: '파워업이 없습니다.' })
        return
      }

      player.powerUps[powerUpKey]--
      room.players.set(socket.id, player)

      io.to(roomCode).emit('powerup:activated', { type, playerId: socket.id })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      handleDisconnect(socket)
    })
  })

  return io
}

function findPlayerRoom(playerId: string): string | null {
  for (const [roomCode, room] of rooms) {
    if (room.players.has(playerId)) {
      return roomCode
    }
  }
  return null
}

function handleDisconnect(socket: Socket) {
  const roomCode = findPlayerRoom(socket.id)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const player = room.players.get(socket.id)
  if (!player) return

  // Mark as disconnected instead of removing (allow reconnect)
  player.isConnected = false
  room.players.set(socket.id, player)

  socket.to(roomCode).emit('player:disconnected', { playerId: socket.id })

  // Clean up empty rooms after a delay
  setTimeout(() => {
    const room = rooms.get(roomCode)
    if (!room) return

    const connectedPlayers = Array.from(room.players.values()).filter(
      (p) => p.isConnected
    )

    if (connectedPlayers.length === 0) {
      if (room.questionTimer) {
        clearTimeout(room.questionTimer)
      }
      rooms.delete(roomCode)
      console.log(`Room ${roomCode} deleted - no connected players`)
    }
  }, 60000) // 1 minute grace period
}

function startGame(io: Server, roomCode: string, room: Room) {
  room.session.status = 'IN_PROGRESS'
  room.session.startedAt = new Date().toISOString()
  room.currentQuestionIndex = 0
  room.answerResults.clear()

  io.to(roomCode).emit('game:started')

  // Send first question
  sendNextQuestion(io, roomCode, room)
}

function sendNextQuestion(io: Server, roomCode: string, room: Room) {
  if (room.currentQuestionIndex >= room.questions.length) {
    endGame(io, roomCode, room)
    return
  }

  const question = room.questions[room.currentQuestionIndex]
  room.answerResults.clear()

  // Send question without answer
  const { answer: _answer, explanation: _explanation, ...questionWithoutAnswer } = question

  io.to(roomCode).emit('question:new', {
    question: { ...questionWithoutAnswer, answer: '', explanation: '' } as Question,
    index: room.currentQuestionIndex,
    total: room.questions.length,
    timeLimit: question.timeLimit,
  })

  // Start timer
  let timeRemaining = question.timeLimit
  const timerInterval = setInterval(() => {
    timeRemaining--
    io.to(roomCode).emit('question:timeUpdate', { remaining: timeRemaining })

    if (timeRemaining <= 0) {
      clearInterval(timerInterval)
      endQuestion(io, roomCode, room)
    }
  }, 1000)

  room.questionTimer = timerInterval as unknown as NodeJS.Timeout
}

function endQuestion(io: Server, roomCode: string, room: Room) {
  if (room.questionTimer) {
    clearInterval(room.questionTimer)
    room.questionTimer = null
  }

  const question = room.questions[room.currentQuestionIndex]

  // Calculate answer distribution
  const answerDistribution: Record<string, number> = {}
  let totalAnswers = 0
  let correctCount = 0
  let totalResponseTime = 0

  for (const [, result] of room.answerResults) {
    answerDistribution[result.answer] = (answerDistribution[result.answer] || 0) + 1
    totalAnswers++
    totalResponseTime += result.responseTime
    if (result.answer === question.answer) {
      correctCount++
    }
  }

  room.session.status = 'SHOWING_RESULTS'

  io.to(roomCode).emit('question:ended', {
    correctAnswer: question.answer,
    explanation: question.explanation,
    stats: {
      totalAnswers,
      correctCount,
      answerDistribution,
      avgResponseTime: totalAnswers > 0 ? totalResponseTime / totalAnswers : 0,
    },
  })

  // Update leaderboard
  const leaderboard: LeaderboardEntry[] = Array.from(room.players.values())
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      playerId: player.id,
      playerName: player.nickname,
      avatarUrl: player.avatarUrl,
      score: player.score,
      rank: index + 1,
      streak: player.streak,
      correctCount: player.correctCount,
    }))

  io.to(roomCode).emit('leaderboard:update', { players: leaderboard })

  // Wait then move to next question
  setTimeout(() => {
    room.currentQuestionIndex++
    room.session.status = 'IN_PROGRESS'
    room.session.currentRound = room.currentQuestionIndex + 1
    sendNextQuestion(io, roomCode, room)
  }, 5000)
}

function endGame(io: Server, roomCode: string, room: Room) {
  room.session.status = 'FINISHED'
  room.session.endedAt = new Date().toISOString()

  // Calculate final results
  const results = Array.from(room.players.values())
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      playerId: player.id,
      playerName: player.nickname,
      avatarUrl: player.avatarUrl,
      score: player.score,
      rank: index + 1,
      streak: player.maxStreak,
      correctCount: player.correctCount,
    }))

  io.to(roomCode).emit('game:finished', {
    results: results.map((r) => ({
      playerId: r.playerId,
      playerName: r.playerName,
      finalRank: r.rank,
      totalScore: r.score,
      correctCount: r.correctCount,
      incorrectCount:
        room.questions.length -
        r.correctCount -
        (room.questions.length - room.answerResults.size),
      avgResponseTime: 0, // Would need to track this
      maxStreak: r.streak,
      pointsEarned: r.score,
      expEarned: Math.floor(r.score / 10),
    })),
    rankings: results,
  })

  // Clean up room after delay
  setTimeout(() => {
    rooms.delete(roomCode)
  }, 300000) // 5 minutes
}

// Utility function to create a room
export function createRoom(
  session: GameSession,
  questions: Question[]
): string {
  const room: Room = {
    session,
    players: new Map(),
    questions,
    currentQuestionIndex: 0,
    questionTimer: null,
    answerResults: new Map(),
  }

  rooms.set(session.roomCode, room)
  return session.roomCode
}

// Utility function to get room info
export function getRoom(roomCode: string): Room | undefined {
  return rooms.get(roomCode)
}
