import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ quizSets: [] })
    }

    const quizSets = await prisma.quizSet.findMany({
      where: { creatorId: session.user.id },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        playCount: true,
        gradeGroup: true,
        createdAt: true,
        subject: {
          select: { name: true }
        },
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      quizSets: quizSets.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        subject: q.subject?.name || '기타',
        gradeGroup: q.gradeGroup || '전체',
        questionCount: q._count.questions,
        playCount: q.playCount,
        isPublic: q.isPublic,
        createdAt: q.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Quiz sets GET error:', error)
    return NextResponse.json({ quizSets: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, subjectId, gradeGroup, isPublic } = body

    const quizSet = await prisma.quizSet.create({
      data: {
        title,
        description,
        subjectId: subjectId || null,
        gradeGroup: gradeGroup || null,
        isPublic: isPublic ?? false,
        creatorId: session.user.id,
      },
      include: {
        _count: { select: { questions: true } }
      }
    })

    return NextResponse.json({
      quizSet: {
        id: quizSet.id,
        title: quizSet.title,
        questionCount: quizSet._count.questions
      }
    })
  } catch (error) {
    console.error('Quiz sets POST error:', error)
    return NextResponse.json({ error: 'Failed to create quiz set' }, { status: 500 })
  }
}
