import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Generate random 6-character code
function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ classrooms: [] })
    }

    const classrooms = await prisma.classroom.findMany({
      where: { ownerId: session.user.id },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        grade: true,
        createdAt: true,
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      classrooms: classrooms.map(c => ({
        id: c.id,
        name: c.name,
        code: c.inviteCode,
        grade: c.grade,
        studentCount: c._count.members,
        createdAt: c.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Classroom GET error:', error)
    return NextResponse.json({ classrooms: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, grade } = body

    if (!name || !grade) {
      return NextResponse.json({ error: 'Name and grade are required' }, { status: 400 })
    }

    // 선생님당 1개 학급만 생성 가능
    const existingClassroom = await prisma.classroom.findFirst({
      where: { ownerId: session.user.id }
    })

    if (existingClassroom) {
      return NextResponse.json({
        error: '선생님당 1개의 학급만 생성할 수 있습니다. 기존 학급을 삭제한 후 다시 시도하세요.',
        existingClassroom: existingClassroom.name
      }, { status: 400 })
    }

    // Generate unique code
    let inviteCode = generateClassCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.classroom.findUnique({ where: { inviteCode } })
      if (!existing) break
      inviteCode = generateClassCode()
      attempts++
    }

    const classroom = await prisma.classroom.create({
      data: {
        name,
        inviteCode,
        grade,
        ownerId: session.user.id,
      }
    })

    return NextResponse.json({
      classroom: {
        id: classroom.id,
        name: classroom.name,
        code: classroom.inviteCode,
        grade: classroom.grade,
        studentCount: 0,
        createdAt: classroom.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Classroom POST error:', error)
    return NextResponse.json({ error: 'Failed to create classroom' }, { status: 500 })
  }
}

// 학급 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    // 학급 소유자 확인
    const classroom = await prisma.classroom.findUnique({
      where: { id: classId }
    })

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 })
    }

    if (classroom.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own classroom' }, { status: 403 })
    }

    // 학급에 속한 학생들 삭제 (학급 멤버 관계 및 학생 계정)
    const members = await prisma.classroomMember.findMany({
      where: { classroomId: classId },
      select: { userId: true }
    })

    const studentUserIds = members.map(m => m.userId)

    // 트랜잭션으로 관련 데이터 모두 삭제
    await prisma.$transaction(async (tx) => {
      // 1. 학급 멤버 관계 삭제
      await tx.classroomMember.deleteMany({
        where: { classroomId: classId }
      })

      // 2. 학생들의 게임 결과 삭제
      if (studentUserIds.length > 0) {
        await tx.gameResult.deleteMany({
          where: { userId: { in: studentUserIds } }
        })

        // 3. 학생 계정 삭제
        await tx.user.deleteMany({
          where: { id: { in: studentUserIds } }
        })
      }

      // 4. 학급 삭제
      await tx.classroom.delete({
        where: { id: classId }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Classroom DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete classroom' }, { status: 500 })
  }
}
