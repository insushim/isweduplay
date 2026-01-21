import { PrismaAdapter } from '@auth/prisma-adapter'
import { type NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import KakaoProvider from 'next-auth/providers/kakao'
import NaverProvider from 'next-auth/providers/naver'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: 'STUDENT' | 'TEACHER' | 'ADMIN'
      totalPoints: number
      level: number
      experience: number
    }
  }

  interface User {
    role: 'STUDENT' | 'TEACHER' | 'ADMIN'
    totalPoints: number
    level: number
    experience: number
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: 'STUDENT' | 'TEACHER' | 'ADMIN'
    totalPoints: number
    level: number
    experience: number
  }
}

export const authConfig: NextAuthConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'STUDENT' as const,
          totalPoints: 0,
          level: 1,
          experience: 0,
        }
      },
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.kakao_account?.profile?.nickname ?? profile.properties?.nickname ?? '학생',
          email: profile.kakao_account?.email,
          image: profile.kakao_account?.profile?.profile_image_url ?? profile.properties?.profile_image,
          role: 'STUDENT' as const,
          totalPoints: 0,
          level: 1,
          experience: 0,
        }
      },
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.response.id,
          name: profile.response.name ?? profile.response.nickname ?? '학생',
          email: profile.response.email,
          image: profile.response.profile_image,
          role: 'STUDENT' as const,
          totalPoints: 0,
          level: 1,
          experience: 0,
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '아이디 또는 이메일', type: 'text' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('아이디와 비밀번호를 입력해주세요.')
        }

        let loginId = credentials.email as string

        // 학생 아이디 형식 (이메일이 아닌 경우) → 이메일로 변환
        if (!loginId.includes('@')) {
          loginId = `${loginId.toLowerCase()}@student.eduplay.local`
        }

        const user = await prisma.user.findUnique({
          where: { email: loginId },
        })

        if (!user || !user.password) {
          throw new Error('등록되지 않은 아이디입니다.')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('비밀번호가 일치하지 않습니다.')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          totalPoints: user.totalPoints,
          level: user.level,
          experience: user.experience,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth sign-ins
      if (account?.provider !== 'credentials') {
        return true
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!
        token.role = user.role
        token.totalPoints = user.totalPoints
        token.level = user.level
        token.experience = user.experience
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token.totalPoints = session.totalPoints ?? token.totalPoints
        token.level = session.level ?? token.level
        token.experience = session.experience ?? token.experience
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as 'STUDENT' | 'TEACHER' | 'ADMIN'
        session.user.totalPoints = token.totalPoints as number
        session.user.level = token.level as number
        session.user.experience = token.experience as number
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Award first login achievement
      const firstLoginAchievement = await prisma.achievement.findFirst({
        where: { code: 'FIRST_LOGIN' },
      })

      if (firstLoginAchievement && user.id) {
        await prisma.userAchievement.create({
          data: {
            userId: user.id,
            achievementId: firstLoginAchievement.id,
            progress: 100,
            isCompleted: true,
            unlockedAt: new Date(),
          },
        }).catch(() => {
          // Achievement might not exist yet
        })
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
