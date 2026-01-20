'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Gamepad2,
  Users,
  Trophy,
  Sparkles,
  Play,
  BookOpen,
  Target,
  Zap,
  Star,
  ArrowRight,
  Brain,
  Rocket,
  Shield,
  Crown,
} from 'lucide-react'

const gameFeatures = [
  {
    icon: Gamepad2,
    title: '15가지 이상의 게임 모드',
    description: '퀴즈 배틀, 타워 디펜스, 서바이벌, 팀 대전 등 다양한 게임으로 학습하세요',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: '실시간 멀티플레이어',
    description: '친구들과 함께 실시간으로 경쟁하며 공부해요',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Trophy,
    title: '랭킹 & 업적 시스템',
    description: '주간 랭킹에서 1위에 도전하고 다양한 업적을 달성하세요',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Brain,
    title: 'AI 맞춤 학습',
    description: '인공지능이 분석한 맞춤형 문제로 효율적으로 학습해요',
    color: 'from-green-500 to-emerald-500',
  },
]

const gameModes = [
  { name: '퀴즈 배틀', icon: '⚔️', color: 'bg-red-500' },
  { name: '스피드 레이스', icon: '🚀', color: 'bg-blue-500' },
  { name: '서바이벌', icon: '💀', color: 'bg-purple-500' },
  { name: '팀 대전', icon: '👥', color: 'bg-green-500' },
  { name: '타워 디펜스', icon: '🏰', color: 'bg-amber-500' },
  { name: '기억력 게임', icon: '🧠', color: 'bg-pink-500' },
  { name: '빙고', icon: '🎯', color: 'bg-cyan-500' },
  { name: '방탈출', icon: '🚪', color: 'bg-indigo-500' },
]

export default function HomePage() {
  const [roomCode, setRoomCode] = useState('')

  const handleJoinGame = () => {
    if (roomCode.trim()) {
      window.location.href = `/join?code=${roomCode.toUpperCase()}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-purple-900 to-pink-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Gamepad2 className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">EDUPLAY</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                로그인
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-primary-900 hover:bg-white/90">
                회원가입
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              배움이{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                놀이가 되는
              </span>
              <br />
              순간
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              2022 개정 교육과정 기반 AI 학습 게임 포털
              <br />
              15가지 이상의 게임 모드로 친구들과 함께 재미있게 공부하세요!
            </p>

            {/* Join Game Form */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="방 번호 입력 (예: ABC123)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="bg-white/90 text-gray-900 text-lg h-14 text-center tracking-widest font-mono"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleJoinGame}
                    variant="game"
                    size="game"
                    className="min-w-[160px]"
                  >
                    <Play className="mr-2 h-6 w-6" />
                    게임 참가
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-primary-900 hover:bg-white/90">
                  <BookOpen className="mr-2 h-5 w-5" />
                  선생님으로 시작하기
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  자세히 알아보기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Game Modes Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Floating game mode cards */}
              {gameModes.map((mode, i) => (
                <motion.div
                  key={mode.name}
                  className={`absolute ${mode.color} p-4 rounded-2xl shadow-xl`}
                  style={{
                    top: `${15 + Math.sin(i * 0.8) * 30}%`,
                    left: `${10 + (i % 4) * 22}%`,
                    transform: `rotate(${-10 + i * 5}deg)`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [-10 + i * 5, -5 + i * 5, -10 + i * 5],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <span className="text-3xl">{mode.icon}</span>
                  <p className="text-white font-medium text-sm mt-1">{mode.name}</p>
                </motion.div>
              ))}

              {/* Central badge */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(251, 191, 36, 0.4)',
                    '0 0 0 20px rgba(251, 191, 36, 0)',
                    '0 0 0 0 rgba(251, 191, 36, 0)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-center text-white">
                  <Trophy className="h-10 w-10 mx-auto mb-1" />
                  <span className="text-sm font-bold">15+ 게임</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 EDUPLAY인가요?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              최신 교육과정과 게이미피케이션의 완벽한 조화
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gameFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                포인트를 모아 레벨업!
                <br />
                <span className="text-amber-400">주간 랭킹에 도전하세요</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                게임을 하면 할수록 경험치와 포인트가 쌓여요.
                레벨이 올라가면 특별한 칭호와 보상을 받을 수 있어요!
              </p>
              <div className="space-y-4">
                {[
                  { icon: Star, text: '정답을 맞출 때마다 포인트 획득', color: 'text-amber-400' },
                  { icon: Zap, text: '연속 정답으로 콤보 보너스', color: 'text-orange-400' },
                  { icon: Crown, text: '주간 랭킹 1위 도전', color: 'text-yellow-400' },
                  { icon: Shield, text: '다양한 업적 달성', color: 'text-purple-400' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <span className="text-white">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Level Card */}
              <Card className="bg-gradient-to-br from-primary-600 to-purple-600 border-0 text-white p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl font-bold">
                    12
                  </div>
                  <div>
                    <p className="text-white/70">현재 레벨</p>
                    <h3 className="text-2xl font-bold">지식의 모험가</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>경험치</span>
                      <span>2,450 / 3,000</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: '82%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">156</p>
                      <p className="text-xs text-white/70">총 게임</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">89%</p>
                      <p className="text-xs text-white/70">정답률</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">#3</p>
                      <p className="text-xs text-white/70">주간 순위</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Floating achievements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-amber-400 text-black px-4 py-2 rounded-xl shadow-lg"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏆 신규 업적 달성!
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              지금 바로 시작하세요!
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              회원가입 없이도 방 번호만 있으면 바로 게임에 참여할 수 있어요.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="xl" className="bg-white text-primary-900 hover:bg-white/90">
                  <Rocket className="mr-2 h-6 w-6" />
                  무료로 시작하기
                </Button>
              </Link>
              <Link href="/join">
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Gamepad2 className="mr-2 h-6 w-6" />
                  게임 참가하기
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">EDUPLAY KOREA</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 EDUPLAY KOREA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
