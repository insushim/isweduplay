'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        setError(data.error || '요청 처리 중 오류가 발생했습니다.')
      }
    } catch {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              repeatType: 'loop',
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <span className="text-4xl">🔑</span>
            </motion.div>
            <CardTitle className="text-3xl font-bold text-white">
              비밀번호 찾기
            </CardTitle>
            <CardDescription className="text-gray-300">
              가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✉️</span>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  이메일을 확인해주세요!
                </h3>
                <p className="text-gray-300 text-sm">
                  <span className="font-medium text-yellow-400">{email}</span>
                  <br />
                  위 주소로 비밀번호 재설정 링크를 보냈습니다.
                  <br />
                  이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-6 text-lg">
                      로그인으로 돌아가기
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="가입하신 이메일 주소"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400"
                    required
                  />
                  <p className="text-xs text-gray-400">
                    학생 계정은 선생님께 문의해주세요
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-6 text-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                    />
                  ) : (
                    '재설정 링크 보내기'
                  )}
                </Button>
              </form>
            )}

            <div className="text-center pt-4">
              <Link
                href="/login"
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                ← 로그인으로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
