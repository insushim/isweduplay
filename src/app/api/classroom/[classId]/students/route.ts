import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'


// 학생 아이디 생성 (학급코드 + 번호)
function generateStudentLoginId(classCode: string, studentNumber: number): string {
  return `${classCode.toLowerCase()}${studentNumber.toString().padStart(2, '0')}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth()
    const { classId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ students: [] })
    }

    // Verify ownership
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classId,
        ownerId: session.user.id
      }
    })

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 })
    }

    const members = await prisma.classroomMember.findMany({
      where: { classroomId: classId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
            totalPoints: true,
            gamesPlayed: true,
            lastPlayedAt: true,
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    })

    return NextResponse.json({
      students: members.map((m, index) => ({
        id: m.user.id,
        number: index + 1,
        name: m.user.name || 'Unknown',
        loginId: m.user.email?.split('@')[0] || '',
        level: m.user.level,
        totalScore: m.user.totalPoints,
        gamesPlayed: m.user.gamesPlayed,
        lastActive: m.user.lastPlayedAt?.toISOString() || null
      }))
    })
  } catch (error) {
    console.error('Classroom students error:', error)
    return NextResponse.json({ students: [] })
  }
}

// 학생 일괄 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth()
    const { classId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // Verify ownership
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classId,
        ownerId: session.user.id
      }
    })

    if (!classroom) {
      return NextResponse.json({ error: '학급을 찾을 수 없습니다.' }, { status: 404 })
    }

    const body = await request.json()
    const { students } = body // [{ name: "홍길동" }, { name: "김철수" }, ...]

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: '학생 정보가 필요합니다.' }, { status: 400 })
    }

    // 기존 학생 수 확인
    const existingCount = await prisma.classroomMember.count({
      where: { classroomId: classId }
    })

    const createdStudents: Array<{
      number: number
      name: string
      loginId: string
      password: string
    }> = []

    for (let i = 0; i < students.length; i++) {
      const studentNumber = existingCount + i + 1
      const studentName = students[i].name || `학생${studentNumber}`
      const loginId = generateStudentLoginId(classroom.inviteCode, studentNumber)
      const password = loginId // 초기 비밀번호는 아이디와 동일
      const hashedPassword = await bcrypt.hash(password, 10)

      // 이메일 형식으로 저장 (로그인용)
      const email = `${loginId}@student.eduplay.local`

      // 학생 계정 생성
      const user = await prisma.user.create({
        data: {
          email,
          name: studentName,
          password: hashedPassword,
          role: 'STUDENT',
        }
      })

      // 학급에 추가
      await prisma.classroomMember.create({
        data: {
          classroomId: classId,
          userId: user.id,
          nickname: studentName,
        }
      })

      createdStudents.push({
        number: studentNumber,
        name: studentName,
        loginId,
        password, // 평문 비밀번호 (선생님에게 보여주기 위해)
      })
    }

    return NextResponse.json({
      success: true,
      students: createdStudents,
      message: `${createdStudents.length}명의 학생이 생성되었습니다.`
    })
  } catch (error) {
    console.error('Create students error:', error)
    return NextResponse.json({ error: '학생 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 학생 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth()
    const { classId } = await params
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // Verify ownership
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classId,
        ownerId: session.user.id
      }
    })

    if (!classroom) {
      return NextResponse.json({ error: '학급을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (studentId) {
      // 단일 학생 삭제
      await prisma.classroomMember.deleteMany({
        where: {
          classroomId: classId,
          userId: studentId,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
