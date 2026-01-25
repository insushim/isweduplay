'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface WordChainGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface WordEntry {
  word: string
  isPlayer: boolean
  isCorrect: boolean
}

export default function WordChainGame({ questions, onComplete, timeLimit }: WordChainGameProps) {
  const [wordChain, setWordChain] = useState<WordEntry[]>([])
  const [currentWord, setCurrentWord] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalTime, setTotalTime] = useState(timeLimit * 5)
  const [turnTime, setTurnTime] = useState(10)
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [hint, setHint] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // 단어 풀 생성 (정답들에서)
  const wordPool = useRef<string[]>(
    questions.map(q => q.answer).filter(a => a.length >= 2)
  )

  // 초기 단어 설정
  useEffect(() => {
    const startWord = wordPool.current[Math.floor(Math.random() * wordPool.current.length)] || '사과'
    setCurrentWord(startWord)
    setWordChain([{ word: startWord, isPlayer: false, isCorrect: true }])
    setUsedWords(new Set([startWord]))
    setIsPlayerTurn(true)
    inputRef.current?.focus()
  }, [])

  // 타이머
  useEffect(() => {
    if (gameOver) return

    const timer = setInterval(() => {
      setTotalTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameOver(true)
          onComplete(score, correctCount)
          return 0
        }
        return prev - 1
      })

      if (isPlayerTurn) {
        setTurnTime(prev => {
          if (prev <= 1) {
            // 시간 초과 - 플레이어 패배
            handleTimeout()
            return 10
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver, isPlayerTurn, score, correctCount, onComplete])

  // 시간 초과 처리
  const handleTimeout = () => {
    setStreak(0)
    setWordChain(prev => [...prev, { word: '⏰ 시간 초과!', isPlayer: true, isCorrect: false }])

    // AI 턴
    setTimeout(() => {
      aiTurn()
    }, 1000)
  }

  // 마지막 글자 가져오기
  const getLastChar = (word: string): string => {
    // 받침 있는 경우 처리
    const lastChar = word.charAt(word.length - 1)
    return lastChar
  }

  // AI 턴
  const aiTurn = useCallback(() => {
    setIsPlayerTurn(false)

    setTimeout(() => {
      const lastChar = getLastChar(currentWord)

      // 가능한 단어 찾기
      const possibleWords = wordPool.current.filter(
        w => w.startsWith(lastChar) && !usedWords.has(w)
      )

      if (possibleWords.length > 0) {
        const aiWord = possibleWords[Math.floor(Math.random() * possibleWords.length)]
        setWordChain(prev => [...prev, { word: aiWord, isPlayer: false, isCorrect: true }])
        setCurrentWord(aiWord)
        setUsedWords(prev => new Set([...prev, aiWord]))
        setIsPlayerTurn(true)
        setTurnTime(10)
        inputRef.current?.focus()
      } else {
        // AI 패배
        setWordChain(prev => [...prev, { word: '🤖 단어 없음! 플레이어 승리!', isPlayer: false, isCorrect: false }])
        setScore(prev => prev + 500)
        setTimeout(() => {
          setGameOver(true)
          onComplete(score + 500, correctCount)
        }, 2000)
      }
    }, 1500)
  }, [currentWord, usedWords, score, correctCount, onComplete])

  // 힌트 생성
  const generateHint = () => {
    const lastChar = getLastChar(currentWord)
    const possibleWords = wordPool.current.filter(
      w => w.startsWith(lastChar) && !usedWords.has(w)
    )

    if (possibleWords.length > 0) {
      const hintWord = possibleWords[Math.floor(Math.random() * possibleWords.length)]
      setHint(`힌트: ${hintWord.charAt(0)}${'.'.repeat(hintWord.length - 1)}`)
      setScore(prev => Math.max(0, prev - 20))
    } else {
      setHint('힌트: 사용 가능한 단어가 없습니다!')
    }
  }

  // 플레이어 단어 제출
  const handleSubmit = () => {
    const word = inputValue.trim()
    if (!word) return

    const lastChar = getLastChar(currentWord)

    // 검증
    let isValid = true
    let errorMsg = ''

    if (!word.startsWith(lastChar)) {
      isValid = false
      errorMsg = `"${lastChar}"로 시작해야 합니다!`
    } else if (usedWords.has(word)) {
      isValid = false
      errorMsg = '이미 사용한 단어입니다!'
    } else if (word.length < 2) {
      isValid = false
      errorMsg = '두 글자 이상이어야 합니다!'
    }

    setInputValue('')
    setHint(null)

    if (isValid) {
      // 정답!
      setWordChain(prev => [...prev, { word, isPlayer: true, isCorrect: true }])
      setCurrentWord(word)
      setUsedWords(prev => new Set([...prev, word]))
      setCorrectCount(prev => prev + 1)
      setStreak(prev => prev + 1)
      setScore(prev => prev + 50 + streak * 10)

      // AI 턴
      aiTurn()
    } else {
      // 오답
      setWordChain(prev => [...prev, { word: `${word} (${errorMsg})`, isPlayer: true, isCorrect: false }])
      setStreak(0)
      setTurnTime(10)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-900 via-green-900 to-lime-900 flex items-center justify-center p-4">
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
            🔗
          </motion.div>
          <h1 className="text-4xl font-bold text-white">끝말잇기 종료!</h1>
          <p className="text-xl text-lime-400">{wordChain.length - 1}개 단어 연결</p>
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-2xl text-white">점수: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400 mt-2">정답 {correctCount}개</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-900 via-green-900 to-lime-900 p-4">
      {/* 상단 UI */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🔗</span>
            <div>
              <h1 className="text-xl font-bold text-white">끝말잇기</h1>
              <p className="text-sm text-gray-400">
                {isPlayerTurn ? '당신의 차례!' : 'AI 생각 중...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-orange-400"
              >
                <span className="text-2xl">🔥</span>
                <span className="font-bold">{streak}</span>
              </motion.div>
            )}

            <div className={`flex items-center gap-2 ${turnTime <= 3 && isPlayerTurn ? 'text-red-400' : 'text-white'}`}>
              <span className="text-2xl">⏱️</span>
              <span className="text-xl font-bold">{isPlayerTurn ? turnTime : '-'}s</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">🕐</span>
              <span className="text-xl font-bold text-white">{formatTime(totalTime)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 현재 단어 */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 text-center">
          <p className="text-sm text-gray-400 mb-2">현재 단어</p>
          <motion.p
            key={currentWord}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-white"
          >
            {currentWord}
          </motion.p>
          <p className="text-lime-400 mt-2 text-xl">
            → "{getLastChar(currentWord)}"로 시작하는 단어를 입력하세요!
          </p>
        </div>
      </div>

      {/* 단어 체인 */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 h-48 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {wordChain.map((entry, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  !entry.isCorrect
                    ? 'bg-red-500/50 text-red-200'
                    : entry.isPlayer
                      ? 'bg-lime-500/50 text-lime-200'
                      : 'bg-blue-500/50 text-blue-200'
                }`}
              >
                {entry.word}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4">
          {hint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-yellow-400 text-center mb-4"
            >
              {hint}
            </motion.p>
          )}

          <div className="flex gap-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && isPlayerTurn && handleSubmit()}
              placeholder={`"${getLastChar(currentWord)}"로 시작하는 단어...`}
              disabled={!isPlayerTurn}
              className="flex-1 px-6 py-4 text-xl bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-lime-400 disabled:opacity-50"
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={!isPlayerTurn || !inputValue.trim()}
              className="px-8 bg-gradient-to-r from-lime-500 to-green-500"
            >
              제출
            </Button>
          </div>

          <div className="flex justify-center mt-4">
            <Button
              onClick={generateHint}
              disabled={!isPlayerTurn}
              variant="outline"
              className="border-lime-500/50 text-lime-400 hover:bg-lime-500/20"
            >
              💡 힌트 (-20점)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
