'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuizSet {
  id: string
  title: string
  description?: string
  subject: string
  grade: number
  questionCount: number
  playCount: number
  isPublic: boolean
  createdAt: string
}

export default function QuizManagePage() {
  const router = useRouter()
  const [quizSets, setQuizSets] = useState<QuizSet[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchQuizSets()
  }, [])

  const fetchQuizSets = async () => {
    try {
      const response = await fetch('/api/quiz/sets')
      const data = await response.json()
      if (data.quizSets) {
        setQuizSets(data.quizSets)
      }
    } catch (error) {
      console.error('Failed to fetch quiz sets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await fetch(`/api/quiz/sets/${id}`, { method: 'DELETE' })
      setQuizSets(quizSets.filter(q => q.id !== id))
    } catch (error) {
      console.error('Failed to delete quiz set:', error)
    }
  }

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    try {
      await fetch(`/api/quiz/sets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      })
      setQuizSets(quizSets.map(q =>
        q.id === id ? { ...q, isPublic: !isPublic } : q
      ))
    } catch (error) {
      console.error('Failed to update quiz set:', error)
    }
  }

  const filteredQuizSets = quizSets
    .filter(q => {
      if (filter === 'public') return q.isPublic
      if (filter === 'private') return !q.isPublic
      return true
    })
    .filter(q =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const subjects = [...new Set(quizSets.map(q => q.subject))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">퀴즈 관리</h1>
            <p className="text-white/70">퀴즈 세트를 만들고 관리하세요</p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            onClick={() => router.push('/quiz/create')}
          >
            + 새 퀴즈 만들기
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="퀴즈 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50"
          />
          <div className="flex gap-2">
            {[
              { key: 'all', label: '전체' },
              { key: 'public', label: '공개' },
              { key: 'private', label: '비공개' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                onClick={() => setFilter(key as typeof filter)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white/10 border-none text-center">
            <div className="text-3xl font-bold text-white">{quizSets.length}</div>
            <div className="text-sm text-white/70">총 퀴즈 세트</div>
          </Card>
          <Card className="p-4 bg-white/10 border-none text-center">
            <div className="text-3xl font-bold text-white">
              {quizSets.reduce((sum, q) => sum + q.questionCount, 0)}
            </div>
            <div className="text-sm text-white/70">총 문제 수</div>
          </Card>
          <Card className="p-4 bg-white/10 border-none text-center">
            <div className="text-3xl font-bold text-white">
              {quizSets.reduce((sum, q) => sum + q.playCount, 0)}
            </div>
            <div className="text-sm text-white/70">총 플레이 수</div>
          </Card>
          <Card className="p-4 bg-white/10 border-none text-center">
            <div className="text-3xl font-bold text-white">{subjects.length}</div>
            <div className="text-sm text-white/70">과목 수</div>
          </Card>
        </div>

        {/* Quiz Set List */}
        {loading ? (
          <div className="text-center py-12 text-white/70">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
            로딩 중...
          </div>
        ) : filteredQuizSets.length === 0 ? (
          <Card className="p-12 bg-white/10 backdrop-blur border-white/20 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '아직 퀴즈가 없습니다'}
            </h2>
            <p className="text-white/70 mb-6">AI를 활용해 퀴즈를 쉽게 만들어보세요</p>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
              onClick={() => router.push('/quiz/create')}
            >
              첫 퀴즈 만들기
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizSets.map((quiz) => (
              <Card
                key={quiz.id}
                className="p-4 bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white truncate">{quiz.title}</h3>
                    <p className="text-sm text-white/70">
                      {quiz.subject} • {quiz.grade}학년
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    quiz.isPublic
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {quiz.isPublic ? '공개' : '비공개'}
                  </span>
                </div>

                {quiz.description && (
                  <p className="text-sm text-white/60 mb-3 line-clamp-2">{quiz.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                  <span>📝 {quiz.questionCount}문제</span>
                  <span>▶️ {quiz.playCount}회</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={() => router.push(`/quiz/edit/${quiz.id}`)}
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleTogglePublic(quiz.id, quiz.isPublic)}
                  >
                    {quiz.isPublic ? '🔒' : '🌐'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(quiz.id)}
                  >
                    🗑️
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
