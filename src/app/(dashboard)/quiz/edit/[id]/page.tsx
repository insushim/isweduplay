'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Question {
  id: string
  order: number
  question: {
    id: string
    questionText: string
    questionType: string
    options: string[]
    correctAnswer: string
    difficulty: string
  }
}

interface QuizSet {
  id: string
  title: string
  description?: string
  isPublic: boolean
  gradeGroup?: string
  subject?: {
    id: string
    name: string
  }
  questions: Question[]
  createdAt: string
}

export default function QuizEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [quizSet, setQuizSet] = useState<QuizSet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    if (id) {
      fetchQuizSet()
    }
  }, [id])

  const fetchQuizSet = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/quiz/sets/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('퀴즈를 찾을 수 없습니다.')
        } else {
          setError('퀴즈를 불러오는데 실패했습니다.')
        }
        return
      }

      const data = await response.json()
      if (data.quizSet) {
        setQuizSet(data.quizSet)
        setTitle(data.quizSet.title || '')
        setDescription(data.quizSet.description || '')
        setIsPublic(data.quizSet.isPublic || false)
      }
    } catch (err) {
      console.error('Failed to fetch quiz set:', err)
      setError('퀴즈를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/quiz/sets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          isPublic,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      router.push('/quiz/manage')
    } catch (err) {
      console.error('Failed to save quiz set:', err)
      alert('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      easy: '쉬움',
      medium: '보통',
      hard: '어려움',
    }
    return labels[difficulty] || difficulty
  }

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      multiple_choice: '객관식',
      true_false: 'O/X',
      short_answer: '단답형',
      fill_blank: '빈칸 채우기',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4" />
          <p>퀴즈 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !quizSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 flex items-center justify-center">
        <Card className="p-8 bg-white/10 backdrop-blur border-white/20 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {error || '퀴즈를 찾을 수 없습니다'}
          </h2>
          <p className="text-white/70 mb-6">
            요청하신 퀴즈가 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-500"
            onClick={() => router.push('/quiz/manage')}
          >
            퀴즈 관리로 돌아가기
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">퀴즈 수정</h1>
            <p className="text-white/70">퀴즈 정보를 수정하세요</p>
          </div>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => router.push('/quiz/manage')}
          >
            ← 목록으로
          </Button>
        </div>

        {/* Edit Form */}
        <Card className="p-6 bg-white/10 backdrop-blur border-white/20 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">기본 정보</h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm text-white/70 mb-2">
                퀴즈 제목 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="퀴즈 제목을 입력하세요"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-white/70 mb-2">
                설명 (선택)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="퀴즈에 대한 설명을 입력하세요"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Public Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="text-white font-medium">공개 설정</div>
                <div className="text-sm text-white/60">
                  {isPublic ? '다른 사용자들이 이 퀴즈를 볼 수 있습니다' : '나만 볼 수 있는 비공개 퀴즈입니다'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Quiz Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-white">{quizSet.questions.length}</div>
                <div className="text-xs text-white/60">문제 수</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-white">{quizSet.subject?.name || '미분류'}</div>
                <div className="text-xs text-white/60">과목</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-white">{quizSet.gradeGroup || '전체'}</div>
                <div className="text-xs text-white/60">학년군</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Questions List */}
        <Card className="p-6 bg-white/10 backdrop-blur border-white/20 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            문제 목록 ({quizSet.questions.length}개)
          </h2>

          {quizSet.questions.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <div className="text-4xl mb-2">📝</div>
              <p>아직 문제가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizSet.questions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium line-clamp-2 mb-2">
                        {q.question.questionText}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-300">
                          {getQuestionTypeLabel(q.question.questionType)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          q.question.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                          q.question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {getDifficultyLabel(q.question.difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => router.push('/quiz/manage')}
            disabled={saving}
          >
            취소
          </Button>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                저장 중...
              </>
            ) : (
              '저장하기'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
