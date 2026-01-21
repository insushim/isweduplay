import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 공유된 퀴즈를 내 퀴즈로 복사
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 원본 퀴즈 조회
    const originalQuizSet = await prisma.quizSet.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            question: true,
          },
        },
        subject: true,
      },
    })

    if (!originalQuizSet) {
      return NextResponse.json({ error: '퀴즈를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 공개 퀴즈만 복사 가능 (또는 자신의 퀴즈)
    if (!originalQuizSet.isPublic && originalQuizSet.creatorId !== session.user.id) {
      return NextResponse.json({ error: '이 퀴즈는 복사할 수 없습니다.' }, { status: 403 })
    }

    // 새 퀴즈 세트 생성
    const newQuizSet = await prisma.quizSet.create({
      data: {
        title: `${originalQuizSet.title} (복사본)`,
        description: originalQuizSet.description,
        thumbnailUrl: originalQuizSet.thumbnailUrl,
        gradeGroup: originalQuizSet.gradeGroup,
        subjectId: originalQuizSet.subjectId,
        creatorId: session.user.id,
        isPublic: false, // 복사본은 기본 비공개
        tags: originalQuizSet.tags,
        questions: {
          create: originalQuizSet.questions.map((q, index) => ({
            questionId: q.questionId,
            order: index + 1,
          })),
        },
      },
      include: {
        _count: { select: { questions: true } },
      },
    })

    return NextResponse.json({
      success: true,
      quizSet: {
        id: newQuizSet.id,
        title: newQuizSet.title,
        questionCount: newQuizSet._count.questions,
      },
    })
  } catch (error) {
    console.error('Quiz copy error:', error)
    return NextResponse.json({ error: '퀴즈 복사 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
