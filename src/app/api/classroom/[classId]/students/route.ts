import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      }
    })

    return NextResponse.json({
      students: members.map(m => ({
        id: m.user.id,
        name: m.user.name || 'Unknown',
        email: m.user.email,
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
