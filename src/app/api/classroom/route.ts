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
