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
  number: number
  name: string
  loginId: string
  level: number
  totalScore: number
  gamesPlayed: number
  lastActive?: string
}

interface CreatedStudent {
  number: number
  name: string
  loginId: string
  password: string
}

export default function ClassroomPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  // 모달 상태
  const [showCreateClassModal, setShowCreateClassModal] = useState(false)
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false)
  const [showStudentInfoModal, setShowStudentInfoModal] = useState(false)

  // 학급 생성 폼
  const [newClassName, setNewClassName] = useState('')
  const [newClassGrade, setNewClassGrade] = useState(1)

  // 학생 생성 폼
  const [studentCount, setStudentCount] = useState(30)
  const [studentNames, setStudentNames] = useState('')
  const [creatingStudents, setCreatingStudents] = useState(false)
  const [createdStudents, setCreatedStudents] = useState<CreatedStudent[]>([])

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
        setShowCreateClassModal(false)
        setNewClassName('')
      }
    } catch (error) {
      console.error('Failed to create classroom:', error)
    }
  }

  const handleAddStudents = async () => {
    if (!selectedClass) return
    setCreatingStudents(true)

    try {
      // 이름 목록 또는 학생 수로 생성
      let studentsToCreate: { name: string }[] = []

      if (studentNames.trim()) {
        // 줄바꿈으로 구분된 이름 목록 사용
        studentsToCreate = studentNames
          .split('\n')
          .map(name => name.trim())
          .filter(name => name)
          .map(name => ({ name }))
      } else {
        // 학생 수만큼 빈 이름으로 생성
        studentsToCreate = Array.from({ length: studentCount }, (_, i) => ({
          name: `${i + 1}번 학생`
        }))
      }

      const response = await fetch(`/api/classroom/${selectedClass.id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: studentsToCreate }),
      })

      const data = await response.json()

      if (data.success) {
        setCreatedStudents(data.students)
        setShowAddStudentsModal(false)
        setShowStudentInfoModal(true)
        setStudentNames('')
        // 학급 정보 갱신
        fetchStudents(selectedClass.id)
        fetchClassrooms()
      } else {
        alert(data.error || '학생 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to add students:', error)
      alert('학생 생성 중 오류가 발생했습니다.')
    } finally {
      setCreatingStudents(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!selectedClass) return
    if (!confirm('정말 이 학생을 삭제하시겠습니까?')) return

    try {
      await fetch(`/api/classroom/${selectedClass.id}/students?studentId=${studentId}`, {
        method: 'DELETE',
      })
      fetchStudents(selectedClass.id)
      fetchClassrooms()
    } catch (error) {
      console.error('Failed to delete student:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('클립보드에 복사되었습니다!')
  }

  const downloadStudentList = () => {
    if (createdStudents.length === 0) return

    const content = createdStudents
      .map(s => `${s.number}번\t${s.name}\t아이디: ${s.loginId}\t비밀번호: ${s.password}`)
      .join('\n')

    const blob = new Blob([`학급: ${selectedClass?.name}\n\n번호\t이름\t아이디\t비밀번호\n${content}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedClass?.name}_학생계정.txt`
    a.click()
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
            onClick={() => setShowCreateClassModal(true)}
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
            <p className="text-white/70 mb-6">학급을 만들어 학생들을 추가하세요</p>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
              onClick={() => setShowCreateClassModal(true)}
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
                      <div className="text-sm text-white/70">학급 코드</div>
                      <div className="text-2xl font-mono font-bold text-yellow-400">
                        {selectedClass.code}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 border-none shadow-lg text-center">
                      <div className="text-3xl font-bold text-white drop-shadow-md">{students.length}</div>
                      <div className="text-sm text-white/90 font-medium">학생 수</div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 border-none shadow-lg text-center">
                      <div className="text-3xl font-bold text-white drop-shadow-md">
                        {students.reduce((sum, s) => sum + s.gamesPlayed, 0)}
                      </div>
                      <div className="text-sm text-white/90 font-medium">총 게임 수</div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-green-600 to-emerald-600 border-none shadow-lg text-center">
                      <div className="text-3xl font-bold text-white drop-shadow-md">
                        {students.length > 0
                          ? Math.round(students.reduce((sum, s) => sum + s.level, 0) / students.length)
                          : 0}
                      </div>
                      <div className="text-sm text-white/90 font-medium">평균 레벨</div>
                    </Card>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">학생 목록</h3>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      onClick={() => setShowAddStudentsModal(true)}
                    >
                      + 학생 추가
                    </Button>
                  </div>

                  {students.length === 0 ? (
                    <div className="text-center py-8 text-white/70">
                      <div className="text-4xl mb-2">👨‍🎓</div>
                      <p>아직 학생이 없습니다</p>
                      <p className="text-sm">학생 추가 버튼을 눌러 학생들을 추가하세요</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {student.number}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{student.name}</div>
                            <div className="text-sm text-white/60">
                              아이디: <span className="font-mono text-yellow-300">{student.loginId}</span>
                            </div>
                          </div>
                          <div className="text-center px-4">
                            <div className="text-lg font-bold text-white">Lv.{student.level}</div>
                            <div className="text-xs text-white/60">{student.gamesPlayed}게임</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white">{student.totalScore.toLocaleString()}</div>
                            <div className="text-xs text-white/60">점</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            🗑️
                          </Button>
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
        {showCreateClassModal && (
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
                  onClick={() => setShowCreateClassModal(false)}
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

        {/* Add Students Modal */}
        {showAddStudentsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg p-6 bg-gradient-to-br from-indigo-900 to-purple-900 border-white/20">
              <h2 className="text-xl font-bold text-white mb-2">학생 일괄 추가</h2>
              <p className="text-white/60 text-sm mb-4">
                학생 계정이 자동으로 생성됩니다. (아이디: 학급코드+번호)
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">
                    학생 이름 목록 (줄바꿈으로 구분)
                  </label>
                  <textarea
                    value={studentNames}
                    onChange={(e) => setStudentNames(e.target.value)}
                    placeholder="홍길동&#10;김철수&#10;이영희&#10;..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 resize-none"
                  />
                  <p className="text-white/50 text-xs mt-1">
                    비워두면 학생 수만큼 "1번 학생", "2번 학생"... 으로 생성됩니다.
                  </p>
                </div>

                {!studentNames.trim() && (
                  <div>
                    <label className="block text-white/80 mb-2">
                      학생 수: {studentCount}명
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={studentCount}
                      onChange={(e) => setStudentCount(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-white/50 text-xs">
                      <span>1명</span>
                      <span>50명</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    setShowAddStudentsModal(false)
                    setStudentNames('')
                  }}
                >
                  취소
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                  onClick={handleAddStudents}
                  disabled={creatingStudents}
                >
                  {creatingStudents ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      생성 중...
                    </>
                  ) : (
                    '학생 생성'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Student Info Modal (생성 결과) */}
        {showStudentInfoModal && createdStudents.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl p-6 bg-gradient-to-br from-indigo-900 to-purple-900 border-white/20 max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">🎉 학생 계정 생성 완료!</h2>
                  <p className="text-white/60 text-sm">아래 정보를 학생들에게 알려주세요</p>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500"
                  onClick={downloadStudentList}
                >
                  📥 목록 다운로드
                </Button>
              </div>

              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <div className="text-white/80 text-sm mb-2">로그인 안내</div>
                <div className="text-white">
                  1. 에듀플레이 접속 → 로그인 <br />
                  2. 아이디와 비밀번호 입력
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-4 gap-4 p-2 bg-white/10 rounded text-white/70 text-sm font-medium">
                  <div>번호</div>
                  <div>이름</div>
                  <div>아이디</div>
                  <div>비밀번호</div>
                </div>
                {createdStudents.map((student) => (
                  <div
                    key={student.number}
                    className="grid grid-cols-4 gap-4 p-2 bg-white/5 rounded text-white items-center"
                  >
                    <div className="font-bold">{student.number}</div>
                    <div>{student.name}</div>
                    <div className="font-mono text-yellow-300">{student.loginId}</div>
                    <div className="font-mono text-green-300">{student.password}</div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                onClick={() => {
                  setShowStudentInfoModal(false)
                  setCreatedStudents([])
                }}
              >
                확인
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
