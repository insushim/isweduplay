import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const gradeGroup = searchParams.get('gradeGroup')

    // 성취기준 조회
    const achievementStandards = await prisma.achievementStandard.findMany({
      where: {
        ...(subjectId && {
          curriculumArea: {
            subjectId,
          },
        }),
        ...(gradeGroup && { gradeGroup }),
      },
      select: {
        id: true,
        code: true,
        gradeGroup: true,
        description: true,
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
        { gradeGroup: 'asc' },
        { code: 'asc' },
      ],
    })

    return NextResponse.json({ achievementStandards })
  } catch (error) {
    console.error('Curriculum GET error:', error)
    return NextResponse.json({ achievementStandards: [] })
  }
}
