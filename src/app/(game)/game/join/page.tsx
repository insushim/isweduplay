'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function JoinGamePage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'code' | 'nickname'>('code')

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (roomCode.length !== 6) {
      setError('방 코드는 6자리입니다.')
      return
    }

    // Verify room exists
    setIsJoining(true)
    try {
      const response = await fetch(`/api/game/room/${roomCode}/verify`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '존재하지 않는 방입니다.')
        return
      }

      setStep('nickname')
    } catch {
      setError('방을 확인하는 중 오류가 발생했습니다.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (nickname.length < 2) {
      setError('닉네임은 2자 이상이어야 합니다.')
      return
    }

    setIsJoining(true)
    try {
      // Navigate to game room with code and nickname
      router.push(`/game/play/${roomCode}?nickname=${encodeURIComponent(nickname)}`)
    } catch {
      setError('게임 참여 중 오류가 발생했습니다.')
      setIsJoining(false)
    }
  }

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length <= 6) {
      setRoomCode(value)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: 0.1,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            {['🎮', '🎯', '🏆', '⭐', '🚀', '💎', '🎲', '🎪'][i % 8]}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3"
            >
              <span className="text-5xl">{step === 'code' ? '🎮' : '👤'}</span>
            </motion.div>
            <CardTitle className="text-3xl font-bold text-white">
              {step === 'code' ? '게임 참여하기' : '닉네임 입력'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {step === 'code'
                ? '선생님이 알려준 방 코드를 입력하세요'
                : '게임에서 사용할 이름을 정해주세요'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {step === 'code' ? (
              <form onSubmit={handleCodeSubmit} className="space-y-6">
                {/* Room Code Input */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">방 코드</label>
                  <div className="flex justify-center gap-2">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-colors ${
                          roomCode[i]
                            ? 'bg-white/20 border-green-400 text-white'
                            : 'bg-white/5 border-white/20 text-gray-500'
                        }`}
                      >
                        {roomCode[i] || '-'}
                      </motion.div>
                    ))}
                  </div>
                  <Input
                    type="text"
                    value={roomCode}
                    onChange={handleRoomCodeChange}
                    placeholder="ABC123"
                    maxLength={6}
                    className="opacity-0 absolute pointer-events-none"
                    autoFocus
                  />
                  {/* Hidden input wrapper for mobile */}
                  <input
                    type="text"
                    value={roomCode}
                    onChange={handleRoomCodeChange}
                    className="w-full p-4 text-center text-2xl font-bold tracking-widest bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-green-400 uppercase"
                    placeholder="ABC123"
                    maxLength={6}
                    autoComplete="off"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={roomCode.length !== 6 || isJoining}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 text-lg disabled:opacity-50"
                >
                  {isJoining ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>🚀 방 찾기</>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-6">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep('code')}
                  className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                >
                  ← 방 코드 변경
                </button>

                {/* Room info */}
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      ✓
                    </div>
                    <div>
                      <p className="text-white font-medium">방 코드: {roomCode}</p>
                      <p className="text-sm text-gray-400">퀴즈 배틀 - 12명 참여 중</p>
                    </div>
                  </div>
                </div>

                {/* Avatar selection */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">아바타 선택</label>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {['🦊', '🐱', '🐶', '🐰', '🐼', '🦁', '🐸', '🐵'].map((emoji, i) => (
                      <motion.button
                        key={i}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 bg-white/10 rounded-xl text-2xl hover:bg-white/20 transition-colors"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Nickname Input */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">닉네임</label>
                  <Input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    maxLength={20}
                    className="w-full p-4 text-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-green-400"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={nickname.length < 2 || isJoining}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 text-lg disabled:opacity-50"
                >
                  {isJoining ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>🎮 게임 입장</>
                  )}
                </Button>
              </form>
            )}

            {/* Help text */}
            <div className="text-center text-gray-500 text-sm">
              <p>방 코드를 모르시나요?</p>
              <p>선생님에게 방 코드를 확인해주세요</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <a
            href="/dashboard"
            className="text-gray-400 hover:text-white text-sm"
          >
            대시보드로 돌아가기
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}
