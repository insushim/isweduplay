import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params

    const session = await prisma.gameSession.findUnique({
      where: { roomCode: roomCode.toUpperCase() },
      include: {
        host: {
          select: { name: true },
        },
        _count: {
          select: { players: true },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (session.status !== 'WAITING') {
      return NextResponse.json({ error: '이미 시작된 게임입니다.' }, { status: 400 })
    }

    if (session._count.players >= session.maxPlayers) {
      return NextResponse.json({ error: '방이 가득 찼습니다.' }, { status: 400 })
    }

    return NextResponse.json({
      roomCode: session.roomCode,
      gameType: session.gameType,
      hostName: session.host.name,
      currentPlayers: session._count.players,
      maxPlayers: session.maxPlayers,
      status: session.status,
    })
  } catch (error) {
    console.error('Verify room error:', error)
    return NextResponse.json(
      { error: '방 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
