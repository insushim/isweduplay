'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Role = 'STUDENT' | 'TEACHER'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<Role>('STUDENT')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole)
    setStep(2)
  }

  const validateForm = () => {
    if (name.length < 2) {
      setError('이름은 최소 2자 이상이어야 합니다.')
      return false
    }
    if (!email.includes('@')) {
      setError('올바른 이메일 형식이 아닙니다.')
      return false
    }
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.')
      return false
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('비밀번호에 영문자와 숫자가 포함되어야 합니다.')
      return false
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '회원가입 중 오류가 발생했습니다.')
        return
      }

      // Show success and redirect to login
      setStep(3)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{
              x: Math.random() * 100 + '%',
              y: '100%',
              opacity: 0.3,
            }}
            animate={{
              y: '-10%',
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            {['🎮', '📚', '🏆', '⭐', '🎯', '🚀', '💡', '🎲'][i % 8]}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <span className="text-4xl">
                {step === 1 ? '👋' : step === 2 ? '✏️' : '🎉'}
              </span>
            </motion.div>
            <CardTitle className="text-3xl font-bold text-white">
              {step === 1
                ? '환영합니다!'
                : step === 2
                ? '회원가입'
                : '가입 완료!'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {step === 1
                ? '어떤 역할로 참여하시겠어요?'
                : step === 2
                ? '정보를 입력해주세요'
                : '에듀플레이 코리아에 오신 것을 환영합니다!'}
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

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect('STUDENT')}
                  className="w-full p-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500/30 rounded-xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                      📚
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">학생</h3>
                      <p className="text-gray-400 text-sm">
                        게임으로 재미있게 학습하고 싶어요
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect('TEACHER')}
                  className="w-full p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-500/30 rounded-xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                      👨‍🏫
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">선생님</h3>
                      <p className="text-gray-400 text-sm">
                        학생들을 위한 학습 게임을 만들고 싶어요
                      </p>
                    </div>
                  </div>
                </motion.button>

                <div className="text-center pt-4">
                  <p className="text-gray-400 text-sm">
                    이미 계정이 있으신가요?{' '}
                    <Link
                      href="/login"
                      className="text-yellow-400 hover:text-yellow-300 font-medium"
                    >
                      로그인
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Form */}
            {step === 2 && (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-400 hover:text-white"
                  >
                    ← 돌아가기
                  </button>
                  <span className="text-gray-500">|</span>
                  <span className="text-sm text-gray-400">
                    {role === 'STUDENT' ? '📚 학생' : '👨‍🏫 선생님'}으로 가입
                  </span>
                </div>

                <Input
                  type="text"
                  placeholder="이름 (닉네임)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />

                <Input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />

                <Input
                  type="password"
                  placeholder="비밀번호 (8자 이상, 영문+숫자)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />

                <Input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />

                {/* Password strength indicator */}
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= level * 3
                            ? level <= 2
                              ? 'bg-red-500'
                              : level === 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p className={password.length >= 8 ? 'text-green-400' : ''}>
                      {password.length >= 8 ? '✓' : '○'} 8자 이상
                    </p>
                    <p className={/[A-Za-z]/.test(password) ? 'text-green-400' : ''}>
                      {/[A-Za-z]/.test(password) ? '✓' : '○'} 영문자 포함
                    </p>
                    <p className={/[0-9]/.test(password) ? 'text-green-400' : ''}>
                      {/[0-9]/.test(password) ? '✓' : '○'} 숫자 포함
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-black font-bold py-6 text-lg mt-4"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                    />
                  ) : (
                    '가입하기'
                  )}
                </Button>
              </motion.form>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl"
                >
                  🎉
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">
                    환영합니다, {name}님!
                  </h3>
                  <p className="text-gray-400">
                    {role === 'STUDENT'
                      ? '재미있는 학습 게임이 기다리고 있어요!'
                      : '학생들과 함께할 준비가 되었어요!'}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-yellow-400">
                    <span className="text-2xl">🎁</span>
                    <span>가입 보너스: 100 코인!</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <span className="text-2xl">🏆</span>
                    <span>&apos;첫 발걸음&apos; 업적 달성!</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm animate-pulse">
                  잠시 후 로그인 페이지로 이동합니다...
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
