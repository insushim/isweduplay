'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReportData {
  overview: {
    totalStudents: number
    totalGames: number
    avgScore: number
    avgAccuracy: number
  }
  subjectStats: {
    subject: string
    gamesPlayed: number
    avgScore: number
    avgAccuracy: number
  }[]
  weeklyProgress: {
    week: string
    games: number
    avgScore: number
  }[]
  topStudents: {
    id: string
    name: string
    gamesPlayed: number
    avgScore: number
    improvement: number
  }[]
  needsAttention: {
    id: string
    name: string
    weakSubject: string
    accuracy: number
  }[]
}

type Period = 'week' | 'month' | 'semester' | 'year'

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all')
  const [classrooms, setClassrooms] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetchClassrooms()
  }, [])

  useEffect(() => {
    fetchReportData()
  }, [period, selectedClassroom])

  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/api/classroom')
      const data = await response.json()
      if (data.classrooms) {
        setClassrooms(data.classrooms)
      }
    } catch (error) {
      console.error('Failed to fetch classrooms:', error)
    }
  }

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports?period=${period}&classroom=${selectedClassroom}`)
      const data = await response.json()
      if (data.report) {
        setReportData(data.report)
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/reports/export?period=${period}&classroom=${selectedClassroom}&format=${format}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${period}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      a.click()
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  const periods: { key: Period; label: string }[] = [
    { key: 'week', label: '이번 주' },
    { key: 'month', label: '이번 달' },
    { key: 'semester', label: '이번 학기' },
    { key: 'year', label: '올해' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">학습 리포트</h1>
            <p className="text-white/70">학생들의 학습 현황을 분석하세요</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => exportReport('excel')}
            >
              📊 Excel
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => exportReport('pdf')}
            >
              📄 PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {periods.map(({ key, label }) => (
              <button
                key={key}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                onClick={() => setPeriod(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          >
            <option value="all" className="bg-indigo-900">전체 학급</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id} className="bg-indigo-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/70">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
            리포트 생성 중...
          </div>
        ) : !reportData ? (
          <Card className="p-12 bg-white/10 backdrop-blur border-white/20 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-white mb-2">데이터가 없습니다</h2>
            <p className="text-white/70">선택한 기간에 게임 데이터가 없습니다</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-none">
                <div className="text-3xl font-bold text-white">{reportData.overview.totalStudents}</div>
                <div className="text-sm text-white/70">참여 학생</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-none">
                <div className="text-3xl font-bold text-white">{reportData.overview.totalGames}</div>
                <div className="text-sm text-white/70">총 게임 수</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-none">
                <div className="text-3xl font-bold text-white">{reportData.overview.avgScore.toLocaleString()}</div>
                <div className="text-sm text-white/70">평균 점수</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-none">
                <div className="text-3xl font-bold text-white">{reportData.overview.avgAccuracy}%</div>
                <div className="text-sm text-white/70">평균 정답률</div>
              </Card>
            </div>

            {/* Subject Stats */}
            <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">과목별 현황</h2>
              {reportData.subjectStats.length === 0 ? (
                <p className="text-center text-white/70 py-4">데이터가 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {reportData.subjectStats.map((stat) => (
                    <div
                      key={stat.subject}
                      className="flex items-center gap-4 p-3 rounded-lg bg-white/5"
                    >
                      <div className="w-24 font-medium text-white">{stat.subject}</div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${stat.avgAccuracy}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-white">{stat.avgAccuracy}%</div>
                        <div className="text-white/60">{stat.gamesPlayed}게임</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Students */}
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">🏆 우수 학생</h2>
                {reportData.topStudents.length === 0 ? (
                  <p className="text-center text-white/70 py-4">데이터가 없습니다</p>
                ) : (
                  <div className="space-y-3">
                    {reportData.topStudents.map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">{student.name}</div>
                          <div className="text-sm text-white/60">{student.gamesPlayed}게임</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white">{student.avgScore.toLocaleString()}</div>
                          <div className={`text-sm ${student.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {student.improvement >= 0 ? '↑' : '↓'} {Math.abs(student.improvement)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Needs Attention */}
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">⚠️ 관심 필요</h2>
                {reportData.needsAttention.length === 0 ? (
                  <p className="text-center text-white/70 py-4">
                    모든 학생이 잘하고 있습니다! 🎉
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reportData.needsAttention.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
                          ⚠️
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">{student.name}</div>
                          <div className="text-sm text-white/60">{student.weakSubject} 어려움</div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-400">{student.accuracy}%</div>
                          <div className="text-sm text-white/60">정답률</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Weekly Progress Chart */}
            <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">주간 진행 현황</h2>
              {reportData.weeklyProgress.length === 0 ? (
                <p className="text-center text-white/70 py-4">데이터가 없습니다</p>
              ) : (
                <div className="flex items-end gap-2 h-48">
                  {reportData.weeklyProgress.map((week, index) => {
                    const maxGames = Math.max(...reportData.weeklyProgress.map(w => w.games))
                    const height = maxGames > 0 ? (week.games / maxGames) * 100 : 0
                    return (
                      <div key={week.week} className="flex-1 flex flex-col items-center">
                        <div className="text-sm text-white mb-2">{week.games}</div>
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t transition-all"
                          style={{ height: `${height}%`, minHeight: week.games > 0 ? '10%' : '0' }}
                        />
                        <div className="text-xs text-white/60 mt-2">{week.week}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
