import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const gradeGroup = searchParams.get('gradeGroup')
    const grade = searchParams.get('grade')
    const semester = searchParams.get('semester')

    // 성취기준 조회
    const achievementStandards = await prisma.achievementStandard.findMany({
      where: {
        ...(subjectId && {
          curriculumArea: {
            subjectId,
          },
        }),
        ...(gradeGroup && { gradeGroup }),
        ...(grade && { grade: parseInt(grade, 10) }),
        ...(semester && { semester: parseInt(semester, 10) }),
      },
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

    return NextResponse.json({ achievementStandards })
  } catch (error) {
    console.error('Curriculum GET error:', error)
    return NextResponse.json({ achievementStandards: [] })
  }
}
