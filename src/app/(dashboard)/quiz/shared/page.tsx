'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Subject {
  id: string
  name: string
  color: string
}

interface SharedQuiz {
  id: string
  title: string
  description?: string
  gradeGroup?: string
  playCount: number
  likeCount: number
  tags: string[]
  isAIGenerated: boolean
  createdAt: string
  creator: {
    id: string
    name?: string
    image?: string
  }
  subject?: {
    id: string
    name: string
    color: string
  }
  questionCount: number
}

const GRADE_OPTIONS = [
  { value: '', label: '전체 학년' },
  { value: '1-2', label: '1-2학년' },
  { value: '3-4', label: '3-4학년' },
  { value: '5-6', label: '5-6학년' },
  { value: '중1', label: '중1' },
  { value: '중2', label: '중2' },
  { value: '중3', label: '중3' },
]

export default function SharedQuizPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [quizzes, setQuizzes] = useState<SharedQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState<string | null>(null)

  // 필터
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // 페이지네이션
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    fetchSharedQuizzes()
  }, [selectedSubject, selectedGrade, page])

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects')
      const data = await response.json()
      if (data.subjects) {
        setSubjects(data.subjects)
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const fetchSharedQuizzes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedSubject) params.set('subjectId', selectedSubject)
      if (selectedGrade) params.set('gradeGroup', selectedGrade)
      if (searchQuery) params.set('search', searchQuery)
      params.set('page', page.toString())

      const response = await fetch(`/api/quiz/shared?${params}`)
      const data = await response.json()

      if (data.quizSets) {
        setQuizzes(data.quizSets)
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch shared quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchSharedQuizzes()
  }

  const handleCopyQuiz = async (quizId: string) => {
    setCopying(quizId)
    try {
      const response = await fetch(`/api/quiz/sets/${quizId}/copy`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        alert(`"${data.quizSet.title}"이(가) 내 퀴즈에 복사되었습니다!`)
      } else {
        alert(data.error || '복사에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to copy quiz:', error)
      alert('복사 중 오류가 발생했습니다.')
    } finally {
      setCopying(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">퀴즈 공유마당</h1>
          <p className="text-white/70">다른 선생님들이 공유한 퀴즈를 찾아보세요</p>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white/10 backdrop-blur border-white/20 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="퀴즈 제목, 태그 검색..."
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-indigo-500 to-purple-500"
              >
                🔍 검색
              </Button>
            </div>

            {/* 과목 필터 */}
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
            >
              <option value="" className="bg-indigo-900">전체 과목</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id} className="bg-indigo-900">
                  {subject.name}
                </option>
              ))}
            </select>

            {/* 학년 필터 */}
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-indigo-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Quiz List */}
        {loading ? (
          <div className="text-center py-12 text-white/70">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
            퀴즈 불러오는 중...
          </div>
        ) : quizzes.length === 0 ? (
          <Card className="p-12 bg-white/10 backdrop-blur border-white/20 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-white mb-2">공유된 퀴즈가 없습니다</h2>
            <p className="text-white/70">
              조건에 맞는 공유 퀴즈가 없습니다. 다른 필터로 검색해보세요.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="p-4 bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white line-clamp-2">{quiz.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {quiz.subject && (
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${quiz.subject.color}30`,
                              color: quiz.subject.color,
                            }}
                          >
                            {quiz.subject.name}
                          </span>
                        )}
                        {quiz.gradeGroup && (
                          <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white/80">
                            {quiz.gradeGroup}
                          </span>
                        )}
                      </div>
                    </div>
                    {quiz.isAIGenerated && (
                      <span className="px-2 py-1 bg-purple-500/30 rounded text-xs text-purple-300">
                        🤖 AI
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {quiz.description && (
                    <p className="text-sm text-white/60 mb-3 line-clamp-2">{quiz.description}</p>
                  )}

                  {/* Tags */}
                  {quiz.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {quiz.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    <span>📝 {quiz.questionCount}문제</span>
                    <span>▶️ {quiz.playCount}회</span>
                    <span>❤️ {quiz.likeCount}</span>
                  </div>

                  {/* Creator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white">
                        {quiz.creator.name?.[0] || '?'}
                      </div>
                      <span className="text-sm text-white/70">
                        {quiz.creator.name || '익명'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCopyQuiz(quiz.id)}
                      disabled={copying === quiz.id}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    >
                      {copying === quiz.id ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <>📥 복사</>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  ← 이전
                </Button>
                <span className="flex items-center px-4 text-white">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  다음 →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
