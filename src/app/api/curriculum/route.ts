import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const gradeGroup = searchParams.get('gradeGroup')
    const grade = searchParams.get('grade')
    const semester = searchParams.get('semester')

    // 디버깅: 요청 파라미터 로깅
    console.log('[Curriculum API] Request params:', { subjectId, gradeGroup, grade, semester })

    // 성취기준 조회
    const whereClause = {
      ...(subjectId && {
        curriculumArea: {
          subjectId,
        },
      }),
      ...(gradeGroup && { gradeGroup }),
      ...(grade && { grade: parseInt(grade, 10) }),
      ...(semester && { semester: parseInt(semester, 10) }),
    }

    console.log('[Curriculum API] Where clause:', JSON.stringify(whereClause))

    const achievementStandards = await prisma.achievementStandard.findMany({
      where: whereClause,
      select: {
        id: true,
        code: true,
        gradeGroup: true,
        grade: true,
        semester: true,
        description: true,
        explanation: true,
        keyCompetencies: true,
        curriculumArea: {
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: [
        { grade: 'asc' },
        { semester: 'asc' },
        { code: 'asc' },
      ],
    })

    console.log('[Curriculum API] Found standards count:', achievementStandards.length)

    return NextResponse.json({ achievementStandards })
  } catch (error) {
    console.error('[Curriculum API] Error:', error)
    // 에러 상세 정보를 응답에 포함 (개발 환경에서만)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      achievementStandards: [],
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal error',
      debug: process.env.NODE_ENV === 'development' ? {
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack?.slice(0, 500) : null
      } : undefined
    })
  }
}
