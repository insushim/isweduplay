import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // 보안상 사용자 존재 여부와 관계없이 성공 응답
    // 실제로는 이메일이 존재할 때만 토큰을 생성하고 이메일 발송
    if (user) {
      // 비밀번호 재설정 토큰 생성
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1시간 후 만료

      // 토큰 저장 (실제 구현시에는 별도 테이블이나 필드 필요)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // passwordResetToken: resetToken,
          // passwordResetExpiry: resetTokenExpiry,
        }
      })

      // TODO: 이메일 발송 구현
      // 개발 환경에서는 콘솔에 출력
      console.log('Password reset token for', email, ':', resetToken)
      console.log('Reset URL would be:', `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`)
    }

    // 항상 성공 응답 (보안을 위해)
    return NextResponse.json({
      success: true,
      message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
