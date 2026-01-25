'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface WheelFortuneGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

const WHEEL_SEGMENTS = [
  { points: 100, color: '#ef4444', label: '100' },
  { points: 200, color: '#f97316', label: '200' },
  { points: 300, color: '#eab308', label: '300' },
  { points: 500, color: '#22c55e', label: '500' },
  { points: 0, color: '#000000', label: '파산' },
  { points: 150, color: '#3b82f6', label: '150' },
  { points: 250, color: '#8b5cf6', label: '250' },
  { points: -100, color: '#6b7280', label: '-100' },
]

export default function WheelFortuneGame({ questions, onComplete, timeLimit }: WheelFortuneGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [currentPoints, setCurrentPoints] = useState(0)
  const [showQuestion, setShowQuestion] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [spinResult, setSpinResult] = useState<string | null>(null)

  const currentQuestion = questions[currentIndex]

  // 휠 돌리기
  const spinWheel = () => {
    if (isSpinning) return

    setIsSpinning(true)

    // 랜덤 결과 선택
    const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length)
    const segment = WHEEL_SEGMENTS[segmentIndex]

    // 회전 각도 계산 (최소 5바퀴 + 세그먼트 위치)
    const segmentAngle = 360 / WHEEL_SEGMENTS.length
    const targetAngle = 360 * 5 + (segmentIndex * segmentAngle) + segmentAngle / 2

    setRotation(prev => prev + targetAngle)

    setTimeout(() => {
      setIsSpinning(false)
      setCurrentPoints(segment.points)

      if (segment.points === 0) {
        // 파산
        setSpinResult('파산! 점수가 0이 됩니다!')
        setScore(0)
        setTimeout(() => {
          setSpinResult(null)
          if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
          } else {
            setGameComplete(true)
            onComplete(0, correctCount)
          }
        }, 2000)
      } else if (segment.points < 0) {
        setSpinResult(`${segment.points}점!`)
        setScore(prev => Math.max(0, prev + segment.points))
        setTimeout(() => {
          setSpinResult(null)
          setShowQuestion(true)
        }, 1500)
      } else {
        setSpinResult(`${segment.points}점 획득 가능!`)
        setTimeout(() => {
          setSpinResult(null)
          setShowQuestion(true)
        }, 1500)
      }
    }, 4000)
  }

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string) => {
    if (!currentQuestion) return

    setSelectedAnswer(answer)
    const correct = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setCorrectCount(prev => prev + 1)
      setScore(prev => prev + currentPoints)
    }

    setTimeout(() => {
      setShowResult(false)
      setShowQuestion(false)
      setSelectedAnswer(null)
      setTextAnswer('')
      setCurrentPoints(0)

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        setGameComplete(true)
        onComplete(score + (correct ? currentPoints : 0), correctCount + (correct ? 1 : 0))
      }
    }, 2500)
  }, [currentQuestion, currentPoints, currentIndex, questions.length, score, correctCount, onComplete])

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-fuchsia-900 to-purple-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: 2 }}
            className="text-[120px]"
          >
            🎡
          </motion.div>
          <h1 className="text-4xl font-bold text-white">게임 종료!</h1>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">최종 점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400 mt-2">정답 {correctCount} / {questions.length}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-fuchsia-900 to-purple-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎡</span>
            <div>
              <h1 className="text-xl font-bold text-white">행운의 바퀴</h1>
              <p className="text-sm text-gray-400">문제 {currentIndex + 1} / {questions.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-2xl font-bold text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {!showQuestion ? (
        // 휠 화면
        <div className="max-w-4xl mx-auto text-center">
          {/* 휠 */}
          <div className="relative w-72 h-72 mx-auto mb-8">
            {/* 포인터 */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 text-4xl">
              ▼
            </div>

            {/* 휠 */}
            <motion.div
              className="w-full h-full rounded-full border-8 border-white/30 overflow-hidden relative"
              style={{
                background: `conic-gradient(
                  ${WHEEL_SEGMENTS.map((seg, i) =>
                    `${seg.color} ${i * (100/WHEEL_SEGMENTS.length)}% ${(i+1) * (100/WHEEL_SEGMENTS.length)}%`
                  ).join(', ')}
                )`
              }}
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {/* 세그먼트 라벨 */}
              {WHEEL_SEGMENTS.map((seg, i) => {
                const angle = (i * (360 / WHEEL_SEGMENTS.length)) + (180 / WHEEL_SEGMENTS.length)
                return (
                  <div
                    key={i}
                    className="absolute w-full text-center font-bold text-white text-sm"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-60px)`,
                    }}
                  >
                    {seg.label}
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* 결과 표시 */}
          <AnimatePresence>
            {spinResult && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="mb-6"
              >
                <p className={`text-3xl font-bold ${
                  spinResult.includes('파산') ? 'text-red-400' :
                  spinResult.includes('-') ? 'text-gray-400' : 'text-yellow-400'
                }`}>
                  {spinResult}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 스핀 버튼 */}
          <Button
            onClick={spinWheel}
            disabled={isSpinning}
            className="px-12 py-6 text-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 disabled:opacity-50"
          >
            {isSpinning ? '🎡 돌아가는 중...' : '🎡 휠 돌리기!'}
          </Button>

          {/* 현재 문제 미리보기 */}
          {currentQuestion && (
            <div className="mt-8 bg-black/40 backdrop-blur-md rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-2">다음 문제</p>
              <p className="text-lg text-white">{currentQuestion.content}</p>
            </div>
          )}
        </div>
      ) : (
        // 문제 화면
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* 획득 가능 점수 */}
            <div className="text-center mb-6">
              <span className="text-yellow-400 text-3xl font-bold">
                정답시 +{currentPoints}점!
              </span>
            </div>

            {/* 문제 */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-white text-center">
                {currentQuestion?.content}
              </h2>
            </div>

            {/* 답변 */}
            {currentQuestion?.type === 'SHORT_ANSWER' || !currentQuestion?.options?.length ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && textAnswer.trim() && handleSubmitAnswer(textAnswer.trim())}
                  placeholder="정답을 입력하세요..."
                  className="w-full px-6 py-4 text-xl bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                  autoFocus
                />
                <Button
                  onClick={() => handleSubmitAnswer(textAnswer.trim())}
                  disabled={!textAnswer.trim()}
                  className="w-full py-6 text-xl bg-gradient-to-r from-purple-500 to-fuchsia-500"
                >
                  제출
                </Button>
              </div>
            ) : currentQuestion?.type === 'TRUE_FALSE' ? (
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: 'O', color: 'from-blue-500 to-blue-700', icon: '⭕' },
                  { value: 'X', color: 'from-red-500 to-red-700', icon: '❌' }
                ].map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSubmitAnswer(opt.value)}
                    disabled={showResult}
                    className={`p-8 rounded-2xl bg-gradient-to-r ${opt.color} text-white font-bold shadow-xl`}
                  >
                    <span className="text-5xl">{opt.icon}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion?.options?.map((option, i) => (
                  <Button
                    key={i}
                    onClick={() => handleSubmitAnswer(option)}
                    disabled={showResult}
                    className={`p-6 text-lg ${
                      ['bg-purple-600', 'bg-fuchsia-600', 'bg-pink-600', 'bg-rose-600'][i % 4]
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* 결과 오버레이 */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: isCorrect ? [0, 360] : [0, -10, 10, -10, 10, 0] }}
                className="text-[100px]"
              >
                {isCorrect ? '🎉' : '😢'}
              </motion.div>
              <h2 className={`text-4xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? `+${currentPoints}점!` : '틀렸습니다!'}
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
