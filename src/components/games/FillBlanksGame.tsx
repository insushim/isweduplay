'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface FillBlanksGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface BlankWord {
  text: string
  isBlank: boolean
  answer: string
  userAnswer: string
  revealed: boolean
}

export default function FillBlanksGame({ questions, onComplete, timeLimit }: FillBlanksGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [words, setWords] = useState<BlankWord[]>([])
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [totalTime, setTotalTime] = useState(timeLimit * 2)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [hints, setHints] = useState(3)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentQuestion = questions[currentIndex]

  // 문장을 빈칸으로 변환
  useEffect(() => {
    if (!currentQuestion) return

    // 정답을 포함한 문장 생성 (문제 + 정답 조합)
    const answer = currentQuestion.answer
    const answerWords = answer.split(/\s+/).filter(w => w.length > 0)

    // 정답이 여러 단어인 경우 일부를 빈칸으로
    const newWords: BlankWord[] = answerWords.map((word, i) => {
      // 2글자 이상인 단어 중 일부를 빈칸으로 (최대 3개)
      const shouldBeBlank = word.length >= 2 && i % 2 === 0
      return {
        text: shouldBeBlank ? '_'.repeat(word.length) : word,
        isBlank: shouldBeBlank,
        answer: word,
        userAnswer: '',
        revealed: !shouldBeBlank
      }
    })

    // 빈칸이 없으면 첫 번째 단어를 빈칸으로
    const blankCount = newWords.filter(w => w.isBlank).length
    if (blankCount === 0 && newWords.length > 0) {
      newWords[0] = {
        ...newWords[0],
        text: '_'.repeat(newWords[0].answer.length),
        isBlank: true,
        revealed: false
      }
    }

    setWords(newWords)
    setCurrentBlankIndex(0)
    setInputValue('')
    inputRef.current?.focus()
  }, [currentQuestion, currentIndex])

  // 타이머
  useEffect(() => {
    if (gameComplete || showResult) return

    const timer = setInterval(() => {
      setTotalTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameComplete(true)
          onComplete(score, correctCount)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameComplete, showResult, score, correctCount, onComplete])

  // 다음 빈칸 찾기
  const findNextBlank = (startIndex: number): number => {
    for (let i = startIndex; i < words.length; i++) {
      if (words[i].isBlank && !words[i].revealed) {
        return i
      }
    }
    return -1
  }

  // 입력 제출
  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return

    const currentBlank = words[currentBlankIndex]
    if (!currentBlank) return

    const correct = inputValue.trim().toLowerCase() === currentBlank.answer.toLowerCase()

    setWords(prev => prev.map((word, i) =>
      i === currentBlankIndex
        ? { ...word, userAnswer: inputValue.trim(), revealed: true, text: correct ? word.answer : `${inputValue.trim()} ❌` }
        : word
    ))

    if (correct) {
      setScore(prev => prev + 50)
      setCorrectCount(prev => prev + 1)
    }

    setInputValue('')

    // 다음 빈칸 찾기
    const nextBlank = findNextBlank(currentBlankIndex + 1)

    if (nextBlank === -1) {
      // 모든 빈칸 완료 - 다음 문제로
      setIsCorrect(correct)
      setShowResult(true)

      setTimeout(() => {
        setShowResult(false)
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          setGameComplete(true)
          onComplete(score + (correct ? 50 : 0), correctCount + (correct ? 1 : 0))
        }
      }, 1500)
    } else {
      setCurrentBlankIndex(nextBlank)
      inputRef.current?.focus()
    }
  }, [inputValue, words, currentBlankIndex, currentIndex, questions.length, score, correctCount, onComplete])

  // 힌트 사용
  const useHint = () => {
    if (hints <= 0) return

    const currentBlank = words[currentBlankIndex]
    if (!currentBlank) return

    // 첫 글자 힌트
    const hintChar = currentBlank.answer.charAt(0)
    setInputValue(hintChar)
    setHints(prev => prev - 1)
    setScore(prev => Math.max(0, prev - 10))
    inputRef.current?.focus()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: 3 }}
            className="text-[120px]"
          >
            ✍️
          </motion.div>
          <h1 className="text-4xl font-bold text-white">빈칸 채우기 완료!</h1>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400 mt-2">정답 {correctCount}개</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!currentQuestion) return null

  const currentBlank = words[currentBlankIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-violet-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">✍️</span>
            <div>
              <h1 className="text-xl font-bold text-white">빈칸 채우기</h1>
              <p className="text-sm text-gray-400">문제 {currentIndex + 1} / {questions.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <span className="text-xl font-bold text-purple-300">{hints}</span>
            </div>

            <div className={`flex items-center gap-2 ${totalTime <= 30 ? 'text-red-400' : 'text-white'}`}>
              <span className="text-2xl">⏱️</span>
              <span className="text-xl font-bold">{formatTime(totalTime)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 문제 */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 mb-6">
          <p className="text-sm text-purple-400 mb-4">문제</p>
          <h2 className="text-xl font-bold text-white text-center mb-6">
            {currentQuestion.content}
          </h2>

          {/* 빈칸 문장 */}
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-3">정답을 완성하세요:</p>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`px-3 py-2 rounded-lg text-xl font-medium ${
                    word.isBlank
                      ? word.revealed
                        ? word.userAnswer.toLowerCase() === word.answer.toLowerCase()
                          ? 'bg-green-500/50 text-green-200'
                          : 'bg-red-500/50 text-red-200'
                        : i === currentBlankIndex
                          ? 'bg-yellow-500 text-black animate-pulse'
                          : 'bg-purple-500/50 text-purple-200'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {word.revealed ? word.text : word.isBlank ? '?' : word.text}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* 입력 영역 */}
        {currentBlank && !currentBlank.revealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-md rounded-2xl p-6"
          >
            <p className="text-sm text-gray-400 mb-4 text-center">
              빈칸에 들어갈 단어를 입력하세요 ({currentBlank.answer.length}글자)
            </p>

            <div className="flex gap-4 mb-4">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && inputValue.trim() && handleSubmit()}
                placeholder="정답 입력..."
                className="flex-1 px-6 py-4 text-xl bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                autoFocus
              />
              <Button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="px-8 bg-gradient-to-r from-purple-500 to-violet-500"
              >
                확인
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={useHint}
                disabled={hints <= 0}
                variant="outline"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
              >
                💡 힌트 (첫 글자) - 남은 횟수: {hints}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

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
                {isCorrect ? '✨' : '📝'}
              </motion.div>
              <h2 className={`text-4xl font-bold ${isCorrect ? 'text-green-400' : 'text-yellow-400'}`}>
                {isCorrect ? '완벽!' : '다음 문제로!'}
              </h2>
              <p className="text-white mt-4 text-xl">
                정답: {currentQuestion.answer}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
