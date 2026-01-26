'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface QuestionAnswerProps {
  question: Question
  onAnswer: (answer: string) => void
  disabled?: boolean
  theme?: 'default' | 'dark' | 'light'
}

export default function QuestionAnswer({
  question,
  onAnswer,
  disabled = false,
  theme = 'default'
}: QuestionAnswerProps) {
  const [textAnswer, setTextAnswer] = useState('')
  const [orderedItems, setOrderedItems] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [fillBlanks, setFillBlanks] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const shuffledRightRef = useRef<string[]>([])

  const questionType = question.type || 'MULTIPLE_CHOICE'

  // 초기화
  useEffect(() => {
    setTextAnswer('')
    setMatchedPairs({})
    setSelectedLeft(null)
    setFillBlanks([])

    if (questionType === 'ORDERING' && question.options) {
      setOrderedItems([...question.options].sort(() => Math.random() - 0.5))
    }

    if (questionType === 'FILL_IN_BLANK') {
      const blankCount = (question.content.match(/_+/g) || []).length || 1
      setFillBlanks(Array(blankCount).fill(''))
    }

    if (questionType === 'MATCHING' && question.options) {
      const rightItems = question.options.filter((_, i) => i % 2 === 1)
      shuffledRightRef.current = [...rightItems].sort(() => Math.random() - 0.5)
    }

    if (questionType === 'SHORT_ANSWER') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [question, questionType])

  const colors = [
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-yellow-600',
  ]
  const icons = ['🔴', '🔵', '🟢', '🟡']

  // OX 퀴즈 (TRUE_FALSE)
  if (questionType === 'TRUE_FALSE') {
    return (
      <div className="grid grid-cols-2 gap-6">
        {[
          { value: 'O', label: 'O', color: 'from-blue-500 to-blue-700', icon: '⭕' },
          { value: 'X', label: 'X', color: 'from-red-500 to-red-700', icon: '❌' }
        ].map((opt) => (
          <motion.button
            key={opt.value}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={() => !disabled && onAnswer(opt.value)}
            disabled={disabled}
            className={`p-8 md:p-12 rounded-2xl bg-gradient-to-r ${opt.color} text-white font-bold shadow-xl transition-all disabled:opacity-50`}
          >
            <div className="text-center">
              <span className="text-6xl md:text-8xl block mb-2">{opt.icon}</span>
              <span className="text-3xl md:text-4xl">{opt.label}</span>
            </div>
          </motion.button>
        ))}
      </div>
    )
  }

  // 순서 맞추기 (ORDERING)
  if (questionType === 'ORDERING') {
    const moveItem = (from: number, to: number) => {
      if (disabled) return
      const newOrder = [...orderedItems]
      const [item] = newOrder.splice(from, 1)
      newOrder.splice(to, 0, item)
      setOrderedItems(newOrder)
    }

    const submitOrder = () => {
      onAnswer(orderedItems.join('|||'))
    }

    return (
      <div className="space-y-4">
        <p className="text-white/70 text-center mb-4">↕️ 위아래 버튼으로 순서를 맞추세요</p>
        <div className="space-y-3">
          {orderedItems.map((item, index) => (
            <motion.div
              key={`${item}-${index}`}
              layout
              className={`flex items-center gap-4 p-4 bg-white/10 rounded-xl border-2 ${
                disabled ? 'border-white/20' : 'border-white/30'
              }`}
            >
              <span className="w-10 h-10 flex items-center justify-center bg-yellow-500 text-black rounded-full font-bold text-lg">
                {index + 1}
              </span>
              <span className="flex-1 text-white text-lg">{item}</span>
              {!disabled && (
                <div className="flex gap-2">
                  <button
                    onClick={() => index > 0 && moveItem(index, index - 1)}
                    className="p-3 bg-white/20 rounded-lg hover:bg-white/30 disabled:opacity-30 text-xl"
                    disabled={index === 0}
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => index < orderedItems.length - 1 && moveItem(index, index + 1)}
                    className="p-3 bg-white/20 rounded-lg hover:bg-white/30 disabled:opacity-30 text-xl"
                    disabled={index === orderedItems.length - 1}
                  >
                    ⬇️
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        {!disabled && (
          <Button
            onClick={submitOrder}
            className="w-full py-6 text-xl bg-gradient-to-r from-green-500 to-emerald-500"
          >
            ✅ 순서 제출하기
          </Button>
        )}
      </div>
    )
  }

  // 빈칸 채우기 (FILL_IN_BLANK)
  if (questionType === 'FILL_IN_BLANK') {
    const submitBlanks = () => {
      onAnswer(fillBlanks.join('|||'))
    }

    const parts = question.content.split(/(_+)/g)

    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="text-xl md:text-2xl text-white leading-relaxed flex flex-wrap items-center gap-2">
            {parts.map((part, i) => {
              if (part.match(/_+/)) {
                const blankIndex = parts.slice(0, i).filter(p => p.match(/_+/)).length
                return (
                  <input
                    key={i}
                    type="text"
                    value={fillBlanks[blankIndex] || ''}
                    onChange={(e) => {
                      const newBlanks = [...fillBlanks]
                      newBlanks[blankIndex] = e.target.value
                      setFillBlanks(newBlanks)
                    }}
                    disabled={disabled}
                    className="w-32 md:w-40 px-3 py-2 bg-yellow-500/30 border-b-2 border-yellow-400 text-yellow-300 text-center focus:outline-none focus:bg-yellow-500/50 rounded"
                    placeholder="?"
                  />
                )
              }
              return <span key={i}>{part}</span>
            })}
          </div>
        </div>
        {!disabled && (
          <Button
            onClick={submitBlanks}
            disabled={fillBlanks.some(b => !b.trim())}
            className="w-full py-6 text-xl bg-gradient-to-r from-green-500 to-emerald-500 disabled:opacity-50"
          >
            ✅ 제출하기
          </Button>
        )}
      </div>
    )
  }

  // 짝 맞추기 (MATCHING)
  if (questionType === 'MATCHING') {
    const leftItems = question.options?.filter((_, i) => i % 2 === 0) || []
    const rightItems = shuffledRightRef.current.length > 0
      ? shuffledRightRef.current
      : (question.options?.filter((_, i) => i % 2 === 1) || [])

    const handleLeftClick = (item: string) => {
      if (disabled || matchedPairs[item]) return
      setSelectedLeft(item)
    }

    const handleRightClick = (item: string) => {
      if (disabled || !selectedLeft || Object.values(matchedPairs).includes(item)) return
      setMatchedPairs(prev => ({ ...prev, [selectedLeft]: item }))
      setSelectedLeft(null)
    }

    const submitMatching = () => {
      const answer = leftItems.map(left => `${left}=${matchedPairs[left] || '?'}`).join('|||')
      onAnswer(answer)
    }

    const allMatched = leftItems.every(item => matchedPairs[item])

    return (
      <div className="space-y-6">
        <p className="text-white/70 text-center">왼쪽과 오른쪽을 짝지어 연결하세요</p>
        <div className="grid grid-cols-2 gap-8">
          {/* 왼쪽 항목 */}
          <div className="space-y-3">
            <p className="text-center text-sm text-white/50 mb-2">📝 문제</p>
            {leftItems.map((item, i) => (
              <motion.button
                key={item}
                whileHover={!disabled && !matchedPairs[item] ? { scale: 1.02 } : {}}
                onClick={() => handleLeftClick(item)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  matchedPairs[item]
                    ? 'bg-green-500/30 border-2 border-green-500'
                    : selectedLeft === item
                    ? 'bg-yellow-500/30 border-2 border-yellow-400'
                    : 'bg-white/10 border-2 border-white/30 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold text-sm">
                    {i + 1}
                  </span>
                  <span className="text-white flex-1">{item}</span>
                  {matchedPairs[item] && <span className="text-green-400">✓</span>}
                </div>
              </motion.button>
            ))}
          </div>

          {/* 오른쪽 항목 */}
          <div className="space-y-3">
            <p className="text-center text-sm text-white/50 mb-2">✨ 정답</p>
            {rightItems.map((item, i) => {
              const isMatched = Object.values(matchedPairs).includes(item)
              return (
                <motion.button
                  key={item}
                  whileHover={!disabled && !isMatched && selectedLeft ? { scale: 1.02 } : {}}
                  onClick={() => handleRightClick(item)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    isMatched
                      ? 'bg-green-500/30 border-2 border-green-500'
                      : selectedLeft && !isMatched
                      ? 'bg-purple-500/20 border-2 border-purple-400 hover:bg-purple-500/30'
                      : 'bg-white/10 border-2 border-white/30'
                  }`}
                  disabled={disabled || isMatched || !selectedLeft}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-purple-500 text-white rounded-full font-bold text-sm">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-white flex-1">{item}</span>
                    {isMatched && <span className="text-green-400">✓</span>}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* 현재 매칭 상태 */}
        {Object.keys(matchedPairs).length > 0 && (
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/70 text-sm mb-2">매칭된 짝:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(matchedPairs).map(([left, right]) => (
                <span key={left} className="px-3 py-1 bg-green-500/30 rounded-full text-green-300 text-sm">
                  {left} ↔ {right}
                </span>
              ))}
            </div>
          </div>
        )}

        {!disabled && (
          <Button
            onClick={submitMatching}
            disabled={!allMatched}
            className="w-full py-6 text-xl bg-gradient-to-r from-green-500 to-emerald-500 disabled:opacity-50"
          >
            {allMatched ? '✅ 제출하기' : `${Object.keys(matchedPairs).length}/${leftItems.length} 매칭됨`}
          </Button>
        )}
      </div>
    )
  }

  // 단답형 (SHORT_ANSWER)
  if (questionType === 'SHORT_ANSWER' || !question.options || question.options.length === 0) {
    const handleSubmit = () => {
      if (textAnswer.trim() && !disabled) {
        onAnswer(textAnswer.trim())
      }
    }

    return (
      <div className="space-y-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <label className="block text-white/70 text-sm mb-2">정답을 입력하세요</label>
          <input
            ref={inputRef}
            type="text"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="답을 입력하세요..."
            className="w-full px-6 py-4 text-xl bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/30"
            disabled={disabled}
            autoFocus
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!textAnswer.trim() || disabled}
          className="w-full py-6 text-xl bg-gradient-to-r from-green-500 to-emerald-500 disabled:opacity-50"
        >
          ✅ 제출하기
        </Button>
      </div>
    )
  }

  // 객관식 (MULTIPLE_CHOICE) - 기본
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {question.options?.map((option, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
          onClick={() => !disabled && onAnswer(option)}
          disabled={disabled}
          className={`p-4 md:p-6 rounded-xl bg-gradient-to-r ${colors[index % 4]} text-white font-bold text-lg md:text-xl shadow-lg transition-all disabled:opacity-50 hover:shadow-xl text-left`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl md:text-3xl flex-shrink-0">{icons[index % 4]}</span>
            <span className="break-words leading-snug" style={{ wordBreak: 'keep-all' }}>
              {option}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
