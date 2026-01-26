'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'
import QuestionAnswer from './QuestionAnswer'

interface TeamBattleGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface Team {
  name: string
  color: string
  score: number
  streak: number
  emoji: string
}

export default function TeamBattleGame({ questions, onComplete, timeLimit }: TeamBattleGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [teams, setTeams] = useState<Team[]>([
    { name: '레드팀', color: 'from-red-500 to-red-700', score: 0, streak: 0, emoji: '🔴' },
    { name: '블루팀', color: 'from-blue-500 to-blue-700', score: 0, streak: 0, emoji: '🔵' }
  ])
  const [currentTeam, setCurrentTeam] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [battleEffect, setBattleEffect] = useState<string | null>(null)

  const [textAnswer, setTextAnswer] = useState('')
  const currentQuestion = questions[currentIndex]
  const activeTeam = teams[currentTeam]

  // 타이머
  useEffect(() => {
    if (gameComplete || showResult) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitAnswer('')
          return timeLimit
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentIndex, gameComplete, showResult, timeLimit, handleSubmitAnswer])

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string) => {
    if (!currentQuestion) return

    setSelectedAnswer(answer)
    const correct = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      const points = 100 + teams[currentTeam].streak * 20
      setTeams(prev => prev.map((team, i) =>
        i === currentTeam
          ? { ...team, score: team.score + points, streak: team.streak + 1 }
          : team
      ))
      setBattleEffect(`${activeTeam.emoji} +${points}점!`)
    } else {
      setTeams(prev => prev.map((team, i) =>
        i === currentTeam
          ? { ...team, streak: 0 }
          : team
      ))
      setBattleEffect(`${activeTeam.emoji} 오답!`)
    }

    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      setTextAnswer('')
      setBattleEffect(null)
      setTimeRemaining(timeLimit)

      // 팀 전환
      setCurrentTeam(prev => (prev + 1) % 2)

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        setGameComplete(true)
        const totalScore = teams[0].score + teams[1].score
        const totalCorrect = Math.floor(totalScore / 100)
        onComplete(totalScore, totalCorrect)
      }
    }, 2000)
  }, [currentQuestion, currentTeam, activeTeam, teams, currentIndex, questions.length, timeLimit, onComplete])

  if (gameComplete) {
    const winner = teams[0].score > teams[1].score ? teams[0] :
                   teams[1].score > teams[0].score ? teams[1] : null

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: 3 }}
            className="text-[120px]"
          >
            🏆
          </motion.div>
          <h1 className="text-4xl font-bold text-white">
            {winner ? `${winner.name} 승리!` : '무승부!'}
          </h1>
          <div className="flex gap-8 justify-center">
            {teams.map((team, i) => (
              <div key={i} className={`bg-gradient-to-br ${team.color} rounded-xl p-6 min-w-[150px]`}>
                <p className="text-4xl mb-2">{team.emoji}</p>
                <p className="text-white font-bold">{team.name}</p>
                <p className="text-3xl text-white font-bold">{team.score}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 p-4">
      {/* 상단 점수판 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="grid grid-cols-3 gap-4">
          {/* 레드팀 */}
          <div className={`bg-gradient-to-br ${teams[0].color} rounded-xl p-4 text-center ${currentTeam === 0 ? 'ring-4 ring-yellow-400' : ''}`}>
            <p className="text-3xl">{teams[0].emoji}</p>
            <p className="text-white font-bold">{teams[0].name}</p>
            <p className="text-3xl text-white font-bold">{teams[0].score}</p>
            {teams[0].streak > 0 && (
              <p className="text-yellow-300 text-sm">🔥 {teams[0].streak}연속</p>
            )}
          </div>

          {/* VS */}
          <div className="flex flex-col items-center justify-center">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl font-bold text-white"
            >
              VS
            </motion.span>
            <p className="text-gray-400 text-sm mt-2">문제 {currentIndex + 1}/{questions.length}</p>
          </div>

          {/* 블루팀 */}
          <div className={`bg-gradient-to-br ${teams[1].color} rounded-xl p-4 text-center ${currentTeam === 1 ? 'ring-4 ring-yellow-400' : ''}`}>
            <p className="text-3xl">{teams[1].emoji}</p>
            <p className="text-white font-bold">{teams[1].name}</p>
            <p className="text-3xl text-white font-bold">{teams[1].score}</p>
            {teams[1].streak > 0 && (
              <p className="text-yellow-300 text-sm">🔥 {teams[1].streak}연속</p>
            )}
          </div>
        </div>
      </div>

      {/* 현재 팀 표시 */}
      <div className="max-w-4xl mx-auto mb-4">
        <motion.div
          key={currentTeam}
          initial={{ x: currentTeam === 0 ? -100 : 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`bg-gradient-to-r ${activeTeam.color} rounded-xl p-4 text-center`}
        >
          <p className="text-xl text-white font-bold">
            {activeTeam.emoji} {activeTeam.name}의 차례!
          </p>
          <div className={`text-3xl font-bold ${timeRemaining <= 5 ? 'text-yellow-300' : 'text-white'}`}>
            ⏱️ {timeRemaining}초
          </div>
        </motion.div>
      </div>

      {/* 문제 */}
      {currentQuestion && (
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-white text-center">
                {currentQuestion.content}
              </h2>
            </div>

            {/* 답변 옵션 - 모든 유형 지원 */}
            <QuestionAnswer
              question={currentQuestion}
              onAnswer={handleSubmitAnswer}
              disabled={showResult}
            />
          </motion.div>
        </div>
      )}

      {/* 배틀 이펙트 */}
      <AnimatePresence>
        {battleEffect && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, -50], opacity: [1, 0] }}
              transition={{ duration: 1.5 }}
              className={`text-5xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
            >
              {battleEffect}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 결과 오버레이 */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={isCorrect ? { rotate: [0, 360] } : { x: [-20, 20, -20, 20, 0] }}
                className="text-[100px]"
              >
                {isCorrect ? '🎯' : '💥'}
              </motion.div>
              <h2 className={`text-4xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '정답!' : '오답!'}
              </h2>
              {!isCorrect && currentQuestion && (
                <p className="text-white/70 mt-4">정답: {currentQuestion.answer}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
