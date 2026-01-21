'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Subject {
  id: string
  code: string
  name: string
  color: string
  schoolLevel: 'ELEMENTARY' | 'MIDDLE' | 'HIGH'
}

interface AchievementStandard {
  id: string
  code: string
  gradeGroup: string
  description: string
  curriculumArea: {
    id: string
    name: string
    subject: {
      id: string
      name: string
      code: string
    }
  }
}

const GRADE_GROUPS = [
  { value: '1-2', label: '1-2학년' },
  { value: '3-4', label: '3-4학년' },
  { value: '5-6', label: '5-6학년' },
  { value: '중1', label: '중학교 1학년' },
  { value: '중2', label: '중학교 2학년' },
  { value: '중3', label: '중학교 3학년' },
]

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '쉬움', color: 'from-green-500 to-emerald-500' },
  { value: 'medium', label: '보통', color: 'from-yellow-500 to-amber-500' },
  { value: 'hard', label: '어려움', color: 'from-red-500 to-pink-500' },
]

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: '4지선다', icon: '📝' },
  { value: 'TRUE_FALSE', label: 'OX 퀴즈', icon: '⭕' },
  { value: 'SHORT_ANSWER', label: '단답형', icon: '✍️' },
  { value: 'FILL_IN_BLANK', label: '빈칸 채우기', icon: '📄' },
]

export default function QuizCreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Step 1: 과목/학년 선택
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedGradeGroup, setSelectedGradeGroup] = useState<string>('')

  // Step 2: 성취기준 선택 또는 자유 주제
  const [mode, setMode] = useState<'curriculum' | 'free'>('curriculum')
  const [achievementStandards, setAchievementStandards] = useState<AchievementStandard[]>([])
  const [selectedStandard, setSelectedStandard] = useState<string>('')
  const [freeTopic, setFreeTopic] = useState('')

  // Step 3: 문제 설정
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [questionCount, setQuestionCount] = useState(10)
  const [questionTypes, setQuestionTypes] = useState<string[]>(['MULTIPLE_CHOICE'])
  const [quizTitle, setQuizTitle] = useState('')

  // 결과
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject && selectedGradeGroup) {
      fetchAchievementStandards()
    }
  }, [selectedSubject, selectedGradeGroup])

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

  const fetchAchievementStandards = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/curriculum?subjectId=${selectedSubject}&gradeGroup=${selectedGradeGroup}`)
      const data = await response.json()
      if (data.achievementStandards) {
        setAchievementStandards(data.achievementStandards)
      }
    } catch (error) {
      console.error('Failed to fetch standards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionTypeToggle = (type: string) => {
    setQuestionTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const generateQuiz = async () => {
    setGenerating(true)
    try {
      const body: any = {
        difficulty,
        questionCount,
        questionTypes,
        includeExplanations: true,
        saveToQuizSet: true,
        saveToDB: true,
        quizSetTitle: quizTitle || (mode === 'curriculum'
          ? achievementStandards.find(s => s.id === selectedStandard)?.description.slice(0, 50)
          : freeTopic),
      }

      if (mode === 'curriculum' && selectedStandard) {
        body.achievementStandardId = selectedStandard
      } else if (mode === 'free' && freeTopic) {
        body.topic = freeTopic
        body.gradeGroup = selectedGradeGroup
        const subject = subjects.find(s => s.id === selectedSubject)
        if (subject) {
          body.subject = subject.name
        }
      }

      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedQuestions(data.questions)
        setStep(4) // 결과 페이지
      } else {
        alert(data.error || '퀴즈 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error)
      alert('퀴즈 생성 중 오류가 발생했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject)
  const selectedStandardData = achievementStandards.find(s => s.id === selectedStandard)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">새 퀴즈 만들기</h1>
          <p className="text-white/70">AI가 교육과정에 맞는 문제를 생성합니다</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step >= s
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-white/20 text-white/50'
                }`}
              >
                {s === 4 ? '✓' : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 md:w-24 h-1 mx-2 rounded transition-colors ${
                    step > s ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-white/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: 과목/학년 선택 */}
        {step === 1 && (
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6">1단계: 과목과 학년 선택</h2>

            <div className="mb-6">
              <label className="block text-white/90 font-medium mb-3">과목 선택</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`p-4 rounded-xl transition-all ${
                      selectedSubject === subject.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white ring-2 ring-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg font-medium">{subject.name}</div>
                    <div className="text-sm opacity-70">
                      {subject.schoolLevel === 'ELEMENTARY' ? '초등' : subject.schoolLevel === 'MIDDLE' ? '중등' : '고등'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-white/90 font-medium mb-3">학년군 선택</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GRADE_GROUPS.map((grade) => (
                  <button
                    key={grade.value}
                    onClick={() => setSelectedGradeGroup(grade.value)}
                    className={`p-4 rounded-xl transition-all ${
                      selectedGradeGroup === grade.value
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white ring-2 ring-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {grade.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedSubject || !selectedGradeGroup}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
              >
                다음 단계 →
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: 성취기준 또는 자유주제 */}
        {step === 2 && (
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6">2단계: 퀴즈 주제 선택</h2>

            {/* Mode Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setMode('curriculum')}
                className={`flex-1 p-4 rounded-xl transition-all ${
                  mode === 'curriculum'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="text-2xl mb-2">📚</div>
                <div className="font-medium">교육과정 기반</div>
                <div className="text-sm opacity-70">성취기준에 맞는 문제</div>
              </button>
              <button
                onClick={() => setMode('free')}
                className={`flex-1 p-4 rounded-xl transition-all ${
                  mode === 'free'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="text-2xl mb-2">✨</div>
                <div className="font-medium">자유 주제</div>
                <div className="text-sm opacity-70">원하는 주제로 문제 생성</div>
              </button>
            </div>

            {mode === 'curriculum' ? (
              <div className="mb-6">
                <label className="block text-white/90 font-medium mb-3">성취기준 선택</label>
                {loading ? (
                  <div className="text-center py-8 text-white/70">
                    <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
                    성취기준 불러오는 중...
                  </div>
                ) : achievementStandards.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    해당 과목/학년의 성취기준이 없습니다.
                    <br />자유 주제 모드를 사용해주세요.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {achievementStandards.map((standard) => (
                      <button
                        key={standard.id}
                        onClick={() => setSelectedStandard(standard.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          selectedStandard === standard.id
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white ring-2 ring-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="px-2 py-1 bg-white/20 rounded text-sm font-mono">
                            {standard.code}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium">{standard.description}</div>
                            <div className="text-sm opacity-70 mt-1">
                              {standard.curriculumArea.name} | {standard.gradeGroup}학년군
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-white/90 font-medium mb-3">퀴즈 주제 입력</label>
                <input
                  type="text"
                  value={freeTopic}
                  onChange={(e) => setFreeTopic(e.target.value)}
                  placeholder="예: 덧셈과 뺄셈, 동물의 한살이, 우리나라의 역사"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-white/60 text-sm mt-2">
                  구체적인 주제를 입력할수록 더 좋은 문제가 생성됩니다.
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                ← 이전
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={mode === 'curriculum' ? !selectedStandard : !freeTopic}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
              >
                다음 단계 →
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: 문제 설정 */}
        {step === 3 && (
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6">3단계: 문제 설정</h2>

            {/* 퀴즈 제목 */}
            <div className="mb-6">
              <label className="block text-white/90 font-medium mb-3">퀴즈 제목</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="퀴즈 제목을 입력하세요 (선택사항)"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* 난이도 선택 */}
            <div className="mb-6">
              <label className="block text-white/90 font-medium mb-3">난이도</label>
              <div className="flex gap-3">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDifficulty(option.value as any)}
                    className={`flex-1 p-4 rounded-xl transition-all ${
                      difficulty === option.value
                        ? `bg-gradient-to-r ${option.color} text-white ring-2 ring-white`
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 문제 수 */}
            <div className="mb-6">
              <label className="block text-white/90 font-medium mb-3">문제 수: {questionCount}개</label>
              <input
                type="range"
                min={5}
                max={30}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-white/60 text-sm mt-1">
                <span>5개</span>
                <span>30개</span>
              </div>
            </div>

            {/* 문제 유형 */}
            <div className="mb-6">
              <label className="block text-white/90 font-medium mb-3">문제 유형</label>
              <div className="grid grid-cols-2 gap-3">
                {QUESTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleQuestionTypeToggle(type.value)}
                    className={`p-4 rounded-xl transition-all ${
                      questionTypes.includes(type.value)
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white ring-2 ring-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span className="text-2xl mr-2">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 요약 */}
            <Card className="p-4 bg-white/5 border-white/10 mb-6">
              <h3 className="font-medium text-white mb-2">퀴즈 요약</h3>
              <div className="text-white/70 text-sm space-y-1">
                <p>• 과목: {selectedSubjectData?.name}</p>
                <p>• 학년군: {selectedGradeGroup}</p>
                <p>• 주제: {mode === 'curriculum' ? selectedStandardData?.description?.slice(0, 50) : freeTopic}</p>
                <p>• 난이도: {DIFFICULTY_OPTIONS.find(d => d.value === difficulty)?.label}</p>
                <p>• 문제 수: {questionCount}개</p>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                ← 이전
              </Button>
              <Button
                onClick={generateQuiz}
                disabled={generating || questionTypes.length === 0}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    AI가 문제 생성 중...
                  </>
                ) : (
                  <>🤖 AI로 퀴즈 생성</>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: 결과 */}
        {step === 4 && (
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">퀴즈가 생성되었습니다!</h2>
              <p className="text-white/70">{generatedQuestions.length}개의 문제가 생성되었습니다</p>
            </div>

            {/* 생성된 문제 미리보기 */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {generatedQuestions.slice(0, 5).map((q, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-xs text-white/80">
                      Q{index + 1}
                    </span>
                    <span className="px-2 py-1 bg-indigo-500/30 rounded text-xs text-indigo-300">
                      {q.type === 'MULTIPLE_CHOICE' ? '4지선다' : q.type === 'TRUE_FALSE' ? 'OX' : q.type}
                    </span>
                  </div>
                  <p className="text-white">{q.content}</p>
                </div>
              ))}
              {generatedQuestions.length > 5 && (
                <p className="text-center text-white/60">
                  +{generatedQuestions.length - 5}개 더...
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setStep(1)
                  setGeneratedQuestions([])
                  setSelectedStandard('')
                  setFreeTopic('')
                  setQuizTitle('')
                }}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                새 퀴즈 만들기
              </Button>
              <Button
                onClick={() => router.push('/quiz/manage')}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                퀴즈 관리로 이동
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
