'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Classroom {
  id: string
  name: string
  code: string
  grade: number
  studentCount: number
  createdAt: string
}

interface Student {
  id: string
  name: string
  email?: string
  level: number
  totalScore: number
  gamesPlayed: number
  lastActive?: string
}

export default function ClassroomPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassGrade, setNewClassGrade] = useState(1)

  useEffect(() => {
    fetchClassrooms()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.id)
    }
  }, [selectedClass])

  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/api/classroom')
      const data = await response.json()
      if (data.classrooms) {
        setClassrooms(data.classrooms)
        if (data.classrooms.length > 0) {
          setSelectedClass(data.classrooms[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch classrooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async (classId: string) => {
    try {
      const response = await fetch(`/api/classroom/${classId}/students`)
      const data = await response.json()
      if (data.students) {
        setStudents(data.students)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return

    try {
      const response = await fetch('/api/classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassName,
          grade: newClassGrade,
        }),
      })

      const data = await response.json()
      if (data.classroom) {
        setClassrooms([...classrooms, data.classroom])
        setSelectedClass(data.classroom)
        setShowCreateModal(false)
        setNewClassName('')
      }
    } catch (error) {
      console.error('Failed to create classroom:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">학급 관리</h1>
            <p className="text-white/70">학급을 만들고 학생들을 관리하세요</p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            onClick={() => setShowCreateModal(true)}
          >
            + 학급 만들기
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/70">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
            로딩 중...
          </div>
        ) : classrooms.length === 0 ? (
          <Card className="p-12 bg-white/10 backdrop-blur border-white/20 text-center">
            <div className="text-6xl mb-4">🏫</div>
            <h2 className="text-xl font-semibold text-white mb-2">아직 학급이 없습니다</h2>
            <p className="text-white/70 mb-6">학급을 만들어 학생들을 초대하세요</p>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
              onClick={() => setShowCreateModal(true)}
            >
              첫 학급 만들기
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Classroom List */}
            <div className="space-y-2">
              {classrooms.map((classroom) => (
                <Card
                  key={classroom.id}
                  className={`p-4 cursor-pointer transition-all border-none ${
                    selectedClass?.id === classroom.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  onClick={() => setSelectedClass(classroom)}
                >
                  <div className="font-semibold text-white">{classroom.name}</div>
                  <div className="text-sm text-white/70">
                    {classroom.grade}학년 • {classroom.studentCount}명
                  </div>
                </Card>
              ))}
            </div>

            {/* Selected Classroom Details */}
            <div className="lg:col-span-3">
              {selectedClass && (
                <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedClass.name}</h2>
                      <p className="text-white/70">{selectedClass.grade}학년</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/70">초대 코드</div>
                      <div className="text-2xl font-mono font-bold text-yellow-400">
                        {selectedClass.code}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 bg-white/10 border-none text-center">
                      <div className="text-3xl font-bold text-white">{students.length}</div>
                      <div className="text-sm text-white/70">학생 수</div>
                    </Card>
                    <Card className="p-4 bg-white/10 border-none text-center">
                      <div className="text-3xl font-bold text-white">
                        {students.reduce((sum, s) => sum + s.gamesPlayed, 0)}
                      </div>
                      <div className="text-sm text-white/70">총 게임 수</div>
                    </Card>
                    <Card className="p-4 bg-white/10 border-none text-center">
                      <div className="text-3xl font-bold text-white">
                        {students.length > 0
                          ? Math.round(students.reduce((sum, s) => sum + s.level, 0) / students.length)
                          : 0}
                      </div>
                      <div className="text-sm text-white/70">평균 레벨</div>
                    </Card>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-4">학생 목록</h3>
                  {students.length === 0 ? (
                    <div className="text-center py-8 text-white/70">
                      <div className="text-4xl mb-2">👨‍🎓</div>
                      <p>아직 학생이 없습니다</p>
                      <p className="text-sm">초대 코드를 공유하여 학생들을 초대하세요</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{student.name}</div>
                            <div className="text-sm text-white/70">
                              Lv.{student.level} • {student.gamesPlayed}게임
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white">{student.totalScore.toLocaleString()}</div>
                            <div className="text-sm text-white/70">점</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Create Classroom Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6 bg-gradient-to-br from-indigo-900 to-purple-900 border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">새 학급 만들기</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">학급 이름</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="예: 3학년 2반"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">학년</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((grade) => (
                      <option key={grade} value={grade} className="bg-indigo-900">
                        {grade}학년
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={() => setShowCreateModal(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                  onClick={handleCreateClass}
                >
                  만들기
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
