'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/game'

interface WordHuntGameProps {
  questions: Question[]
  onComplete: (score: number, correctCount: number) => void
  timeLimit: number
}

interface Cell {
  row: number
  col: number
  letter: string
  isSelected: boolean
  isFound: boolean
  wordId?: string
}

interface Word {
  id: string
  word: string
  hint: string
  found: boolean
  cells: { row: number; col: number }[]
}

export default function WordHuntGame({ questions, onComplete, timeLimit }: WordHuntGameProps) {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [words, setWords] = useState<Word[]>([])
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([])
  const [score, setScore] = useState(0)
  const [foundCount, setFoundCount] = useState(0)
  const [totalTime, setTotalTime] = useState(timeLimit * 3)
  const [isDragging, setIsDragging] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [activeHint, setActiveHint] = useState<Word | null>(null)
  const [showFound, setShowFound] = useState(false)
  const [foundWord, setFoundWord] = useState<string>('')
  const gridRef = useRef<HTMLDivElement>(null)

  const GRID_SIZE = 10
  const KOREAN_LETTERS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ가나다라마바사아자차카타파하'

  // 그리드에 단어 배치
  useEffect(() => {
    const wordList = questions.slice(0, 8).map((q, i) => ({
      id: `word-${i}`,
      word: q.answer.replace(/\s/g, ''),
      hint: q.content,
      found: false,
      cells: [] as { row: number; col: number }[]
    }))

    // 그리드 초기화
    const newGrid: Cell[][] = Array(GRID_SIZE).fill(null).map((_, row) =>
      Array(GRID_SIZE).fill(null).map((_, col) => ({
        row,
        col,
        letter: '',
        isSelected: false,
        isFound: false
      }))
    )

    // 단어 배치 함수
    const placeWord = (word: Word): boolean => {
      const directions = [
        [0, 1],   // 가로
        [1, 0],   // 세로
        [1, 1],   // 대각선 (우하)
        [0, -1],  // 가로 역방향
        [-1, 0],  // 세로 역방향
        [-1, -1], // 대각선 (좌상)
      ]

      // 랜덤으로 방향과 시작점 시도
      for (let attempt = 0; attempt < 100; attempt++) {
        const dir = directions[Math.floor(Math.random() * directions.length)]
        const startRow = Math.floor(Math.random() * GRID_SIZE)
        const startCol = Math.floor(Math.random() * GRID_SIZE)

        const endRow = startRow + dir[0] * (word.word.length - 1)
        const endCol = startCol + dir[1] * (word.word.length - 1)

        // 범위 체크
        if (endRow < 0 || endRow >= GRID_SIZE || endCol < 0 || endCol >= GRID_SIZE) continue

        // 배치 가능 여부 확인
        let canPlace = true
        const cells: { row: number; col: number }[] = []

        for (let i = 0; i < word.word.length; i++) {
          const r = startRow + dir[0] * i
          const c = startCol + dir[1] * i
          const existingLetter = newGrid[r][c].letter

          if (existingLetter && existingLetter !== word.word[i]) {
            canPlace = false
            break
          }
          cells.push({ row: r, col: c })
        }

        if (canPlace) {
          // 단어 배치
          for (let i = 0; i < word.word.length; i++) {
            const r = cells[i].row
            const c = cells[i].col
            newGrid[r][c].letter = word.word[i]
            newGrid[r][c].wordId = word.id
          }
          word.cells = cells
          return true
        }
      }
      return false
    }

    // 단어 배치
    const placedWords: Word[] = []
    for (const word of wordList) {
      if (placeWord(word)) {
        placedWords.push(word)
      }
    }

    // 빈 칸 랜덤 문자로 채우기
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!newGrid[row][col].letter) {
          newGrid[row][col].letter = KOREAN_LETTERS[Math.floor(Math.random() * KOREAN_LETTERS.length)]
        }
      }
    }

    setGrid(newGrid)
    setWords(placedWords)
  }, [questions])

  // 타이머
  useEffect(() => {
    if (foundCount === words.length && words.length > 0) return

    const timer = setInterval(() => {
      setTotalTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete(score, foundCount)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [foundCount, words.length, score, onComplete])

  // 게임 완료 체크
  useEffect(() => {
    if (words.length > 0 && foundCount === words.length) {
      setTimeout(() => {
        onComplete(score, foundCount)
      }, 1500)
    }
  }, [foundCount, words.length, score, onComplete])

  // 셀 선택 시작
  const handleCellMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    setSelectedCells([{ row, col }])
    setGrid(prev => prev.map((r, ri) =>
      r.map((c, ci) => ({
        ...c,
        isSelected: ri === row && ci === col
      }))
    ))
  }

  // 셀 드래그
  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isDragging) return

    const first = selectedCells[0]
    if (!first) return

    // 직선 방향으로만 선택 가능
    const dRow = row - first.row
    const dCol = col - first.col

    // 직선인지 확인
    const isValidLine =
      dRow === 0 ||
      dCol === 0 ||
      Math.abs(dRow) === Math.abs(dCol)

    if (!isValidLine) return

    // 선택된 셀들 계산
    const stepRow = dRow === 0 ? 0 : dRow / Math.abs(dRow)
    const stepCol = dCol === 0 ? 0 : dCol / Math.abs(dCol)
    const length = Math.max(Math.abs(dRow), Math.abs(dCol)) + 1

    const newSelected: { row: number; col: number }[] = []
    for (let i = 0; i < length; i++) {
      newSelected.push({
        row: first.row + stepRow * i,
        col: first.col + stepCol * i
      })
    }

    setSelectedCells(newSelected)
    setGrid(prev => prev.map((r, ri) =>
      r.map((c, ci) => ({
        ...c,
        isSelected: newSelected.some(s => s.row === ri && s.col === ci)
      }))
    ))
  }

  // 선택 완료
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    // 선택된 셀로 단어 조합
    const selectedWord = selectedCells.map(s => grid[s.row]?.[s.col]?.letter || '').join('')

    // 단어 매칭 확인
    const matchedWord = words.find(w =>
      !w.found &&
      (w.word === selectedWord || w.word === selectedWord.split('').reverse().join(''))
    )

    if (matchedWord) {
      // 단어 찾음!
      setFoundWord(matchedWord.word)
      setShowFound(true)

      // 점수 계산
      const basePoints = 100
      const lengthBonus = matchedWord.word.length * 10
      setScore(prev => prev + basePoints + lengthBonus)
      setFoundCount(prev => prev + 1)

      // 단어와 그리드 업데이트
      setWords(prev => prev.map(w =>
        w.id === matchedWord.id ? { ...w, found: true } : w
      ))

      setGrid(prev => prev.map((r, ri) =>
        r.map((c, ci) => ({
          ...c,
          isFound: c.isFound || selectedCells.some(s => s.row === ri && s.col === ci),
          isSelected: false
        }))
      ))

      setTimeout(() => setShowFound(false), 1500)
    } else {
      // 매칭 실패, 선택 해제
      setGrid(prev => prev.map(r =>
        r.map(c => ({ ...c, isSelected: false }))
      ))
    }

    setSelectedCells([])
  }, [isDragging, selectedCells, grid, words])

  // 힌트 보기
  const handleShowHint = (word: Word) => {
    setActiveHint(word)
    setShowHint(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-violet-900 to-indigo-900 p-4"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 상단 UI */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🔍</span>
            <div>
              <h1 className="text-xl font-bold text-white">단어 찾기</h1>
              <p className="text-sm text-gray-400">숨겨진 단어를 찾아 드래그하세요!</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* 찾은 단어 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-xl font-bold text-green-400">
                {foundCount} / {words.length}
              </span>
            </div>

            {/* 시간 */}
            <div className={`flex items-center gap-2 ${totalTime <= 30 ? 'text-red-400' : 'text-white'}`}>
              <span className="text-2xl">⏱️</span>
              <span className="text-xl font-bold">{formatTime(totalTime)}</span>
            </div>

            {/* 점수 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 그리드 */}
        <div className="lg:col-span-2">
          <div
            ref={gridRef}
            className="bg-black/40 backdrop-blur-md rounded-xl p-4"
          >
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
              {grid.map((row, ri) =>
                row.map((cell, ci) => (
                  <motion.div
                    key={`${ri}-${ci}`}
                    onMouseDown={() => handleCellMouseDown(ri, ci)}
                    onMouseEnter={() => handleCellMouseEnter(ri, ci)}
                    className={`aspect-square flex items-center justify-center text-lg md:text-xl font-bold rounded-lg cursor-pointer select-none transition-all ${
                      cell.isFound
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                        : cell.isSelected
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white scale-110'
                          : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {cell.letter}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 찾을 단어 목록 */}
        <div className="space-y-4">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📝</span> 찾을 단어
            </h3>
            <div className="space-y-2">
              {words.map((word) => (
                <div
                  key={word.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    word.found
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-white/10'
                  }`}
                >
                  <span className={`font-medium ${
                    word.found ? 'text-green-400 line-through' : 'text-white'
                  }`}>
                    {word.found ? word.word : '?'.repeat(word.word.length)}
                  </span>
                  {!word.found && (
                    <Button
                      onClick={() => handleShowHint(word)}
                      variant="ghost"
                      size="sm"
                      className="text-yellow-400 hover:bg-yellow-400/20"
                    >
                      💡
                    </Button>
                  )}
                  {word.found && (
                    <span className="text-green-400">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 게임 안내 */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-2">🎮 조작 방법</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 마우스로 드래그하여 단어 선택</li>
              <li>• 가로, 세로, 대각선 방향 가능</li>
              <li>• 역방향으로도 찾을 수 있어요</li>
              <li>• 힌트 버튼으로 문제 확인</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 힌트 모달 */}
      <AnimatePresence>
        {showHint && activeHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHint(false)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-violet-800 to-indigo-900 rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-4xl mb-4 text-center">💡</div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">힌트</h3>
              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <p className="text-white text-center">{activeHint.hint}</p>
              </div>
              <p className="text-center text-gray-400 mb-4">
                {activeHint.word.length}글자 단어입니다
              </p>
              <Button
                onClick={() => setShowHint(false)}
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-500"
              >
                확인
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 단어 찾음 애니메이션 */}
      <AnimatePresence>
        {showFound && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-[80px] mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-2">찾았다!</h2>
              <p className="text-3xl text-yellow-400 font-bold">{foundWord}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
