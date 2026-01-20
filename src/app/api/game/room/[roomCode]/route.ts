import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params

    const gameSession = await prisma.gameSession.findUnique({
      where: { roomCode },
      include: {
        quizSet: {
          include: {
            questions: {
              include: {
                question: true
              },
              orderBy: { order: 'asc' }
            }
          }
        },
        host: {
          select: { id: true, name: true }
        }
      }
    })

    if (!gameSession) {
      return NextResponse.json({ error: '게임을 찾을 수 없습니다.' }, { status: 404 })
    }

    // Transform questions from QuizSetQuestion relation to Question format
    const questions = gameSession.quizSet?.questions?.map((q) => ({
      id: q.question.id,
      type: q.question.type || 'MULTIPLE_CHOICE',
      content: q.question.content,
      options: q.question.options as string[] || [],
      answer: q.question.answer,
      explanation: q.question.answerExplanation,
      imageUrl: q.question.imageUrl,
      timeLimit: q.question.timeLimit || (gameSession.settings as { timeLimit?: number })?.timeLimit || 30,
      points: q.question.points || 100,
      difficulty: q.question.difficulty || 1,
    })) || []

    // Get settings with defaults
    const settings = gameSession.settings as { timeLimit?: number; questionCount?: number } || {}

    return NextResponse.json({
      game: {
        id: gameSession.id,
        roomCode: gameSession.roomCode,
        gameType: gameSession.gameType,
        status: gameSession.status,
        hostId: gameSession.hostId,
        hostName: gameSession.host.name,
        quizSetId: gameSession.quizSetId,
        settings: {
          timeLimit: settings.timeLimit || 30,
          questionCount: settings.questionCount || questions.length,
        },
        questions,
        maxPlayers: gameSession.maxPlayers,
        createdAt: gameSession.createdAt,
      }
    })
  } catch (error) {
    console.error('Get game room error:', error)
    return NextResponse.json(
      { error: '게임 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
