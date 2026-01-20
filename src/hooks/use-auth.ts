'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const user = session?.user

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.refresh()
      return result
    },
    [router]
  )

  const loginWithProvider = useCallback(
    async (provider: 'google' | 'kakao' | 'naver', callbackUrl?: string) => {
      await signIn(provider, { callbackUrl: callbackUrl || '/dashboard' })
    },
    []
  )

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/' })
  }, [])

  const register = useCallback(
    async (data: {
      email: string
      password: string
      name: string
      role: 'STUDENT' | 'TEACHER'
    }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '회원가입에 실패했습니다.')
      }

      return result
    },
    []
  )

  const updateSession = useCallback(
    async (data: Partial<{ totalPoints: number; level: number; experience: number }>) => {
      await update(data)
    },
    [update]
  )

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    loginWithProvider,
    logout,
    register,
    updateSession,
  }
}

// Hook for protected routes
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (!isLoading && !isAuthenticated) {
    router.push(redirectTo)
  }

  return { isAuthenticated, isLoading }
}

// Hook for role-based access
export function useRequireRole(
  allowedRoles: Array<'STUDENT' | 'TEACHER' | 'ADMIN'>,
  redirectTo = '/dashboard'
) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const hasAccess = user && allowedRoles.includes(user.role)

  if (!isLoading && isAuthenticated && !hasAccess) {
    router.push(redirectTo)
  }

  return { hasAccess, isLoading }
}
