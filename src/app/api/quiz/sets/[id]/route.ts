import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const quizSet = await prisma.quizSet.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            question: true
          }
        },
        subject: true,
      }
    })

    if (!quizSet) {
      return NextResponse.json({ error: 'Quiz set not found' }, { status: 404 })
    }

    return NextResponse.json({ quizSet })
  } catch (error) {
    console.error('Quiz set GET error:', error)
    return NextResponse.json({ error: 'Failed to get quiz set' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.quizSet.findFirst({
      where: { id, creatorId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Quiz set not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, isPublic } = body

    const quizSet = await prisma.quizSet.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
      }
    })

    return NextResponse.json({ quizSet })
  } catch (error) {
    console.error('Quiz set PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update quiz set' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.quizSet.findFirst({
      where: { id, creatorId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Quiz set not found' }, { status: 404 })
    }

    await prisma.quizSet.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quiz set DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete quiz set' }, { status: 500 })
  }
}
