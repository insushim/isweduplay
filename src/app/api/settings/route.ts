import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ settings: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
      }
    })

    if (!user) {
      return NextResponse.json({ settings: null })
    }

    // 기본 설정값 (향후 User 모델에 settings 필드 추가 시 DB에서 로드)
    const defaultSettings = {
      notifications: {
        email: true,
        push: true,
        gameInvites: true,
        achievements: true,
      },
      privacy: {
        showProfile: true,
        showStats: true,
        showHistory: true,
      },
      preferences: {
        theme: 'dark',
        language: 'ko',
        soundEnabled: true,
        musicEnabled: true,
        animationsEnabled: true,
      },
    }

    return NextResponse.json({
      settings: {
        displayName: user.name,
        email: user.email,
        avatar: user.image,
        ...defaultSettings,
      }
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ settings: null })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { displayName } = body

    // 현재는 displayName만 업데이트 (향후 User 모델에 settings 필드 추가 시 확장)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: displayName || undefined,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
