import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(/[A-Za-z]/, '비밀번호에 영문자가 포함되어야 합니다.')
    .regex(/[0-9]/, '비밀번호에 숫자가 포함되어야 합니다.'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  role: z.enum(['STUDENT', 'TEACHER']).default('STUDENT'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user with initial gamification data
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        totalPoints: 0,
        weeklyPoints: 0,
        level: 1,
        experience: 0,
        streak: 0,
        maxStreak: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        totalCorrect: 0,
        totalAnswered: 0,
        coins: 100, // Starting coins
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        totalPoints: true,
        level: true,
        experience: true,
      },
    })

    // Create initial achievements for new user
    const welcomeAchievement = await prisma.achievement.findFirst({
      where: { code: 'WELCOME' },
    })

    if (welcomeAchievement) {
      await prisma.userAchievement.create({
        data: {
          userId: user.id,
          achievementId: welcomeAchievement.id,
          progress: 100,
          isCompleted: true,
          unlockedAt: new Date(),
        },
      }).catch(() => {})
    }

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다!',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
