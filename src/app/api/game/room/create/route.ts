import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createRoomSchema = z.object({
  gameType: z.enum([
    'QUIZ_BATTLE',
    'SPEED_RACE',
    'SURVIVAL',
    'TEAM_BATTLE',
    'TOWER_DEFENSE',
    'MEMORY_MATCH',
    'WORD_HUNT',
    'BINGO',
    'ESCAPE_ROOM',
    'PUZZLE_QUEST',
    'MATH_RUNNER',
    'WORD_CHAIN',
    'JEOPARDY',
    'WHEEL_FORTUNE',
    'FLASH_CARDS',
    'MATCHING_PAIRS',
    'FILL_THE_BLANKS',
    'TIME_ATTACK',
  ]),
  quizSetId: z.string().optional(),
  settings: z
    .object({
      timeLimit: z.number().min(5).max(120).default(30),
      pointMultiplier: z.number().min(1).max(5).default(1),
      shuffleQuestions: z.boolean().default(true),
      shuffleAnswers: z.boolean().default(true),
      showLeaderboard: z.boolean().default(true),
      allowReconnect: z.boolean().default(true),
      maxLives: z.number().min(1).max(10).optional(),
      teamCount: z.number().min(2).max(10).optional(),
    })
    .default({}),
  maxPlayers: z.number().min(1).max(100).default(50),
})

// Generate random 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRoomSchema.parse(body)

    // Generate unique room code
    let roomCode = generateRoomCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.gameSession.findUnique({
        where: { roomCode },
      })
      if (!existing) break
      roomCode = generateRoomCode()
      attempts++
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: '방 코드 생성에 실패했습니다. 다시 시도해주세요.' },
        { status: 500 }
      )
    }

    // Get questions if quizSetId provided
    let questions: { id: string }[] = []
    if (validatedData.quizSetId) {
      const quizSet = await prisma.quizSet.findUnique({
        where: { id: validatedData.quizSetId },
        include: { questions: true },
      })

      if (!quizSet) {
        return NextResponse.json({ error: '퀴즈 세트를 찾을 수 없습니다.' }, { status: 404 })
      }

      questions = quizSet.questions
    }

    // Create game session
    const gameSession = await prisma.gameSession.create({
      data: {
        hostId: session.user.id,
        roomCode,
        gameType: validatedData.gameType,
        gameMode: 'CLASSIC',
        status: 'WAITING',
        maxPlayers: validatedData.maxPlayers,
        currentRound: 0,
        totalRounds: questions.length || 10,
        quizSetId: validatedData.quizSetId,
        settings: validatedData.settings,
      },
    })

    return NextResponse.json({
      roomCode: gameSession.roomCode,
      sessionId: gameSession.id,
      gameType: gameSession.gameType,
      maxPlayers: gameSession.maxPlayers,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Create room error:', error)
    return NextResponse.json(
      { error: '방 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
