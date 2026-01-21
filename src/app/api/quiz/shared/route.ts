import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 공유된 퀴즈 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const gradeGroup = searchParams.get('gradeGroup')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      isPublic: true,
      questions: {
        some: {}, // 최소 1개 이상의 문제가 있어야 함
      },
    }

    if (subjectId) {
      where.subjectId = subjectId
    }

    if (gradeGroup) {
      where.gradeGroup = gradeGroup
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ]
    }

    const [quizSets, total] = await Promise.all([
      prisma.quizSet.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          gradeGroup: true,
          playCount: true,
          likeCount: true,
          tags: true,
          isAIGenerated: true,
          createdAt: true,
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          _count: {
            select: { questions: true },
          },
        },
        orderBy: [
          { playCount: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quizSet.count({ where }),
    ])

    return NextResponse.json({
      quizSets: quizSets.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        thumbnailUrl: q.thumbnailUrl,
        gradeGroup: q.gradeGroup,
        playCount: q.playCount,
        likeCount: q.likeCount,
        tags: q.tags,
        isAIGenerated: q.isAIGenerated,
        createdAt: q.createdAt.toISOString(),
        creator: q.creator,
        subject: q.subject,
        questionCount: q._count.questions,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Shared quiz GET error:', error)
    return NextResponse.json({ quizSets: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } })
  }
}
