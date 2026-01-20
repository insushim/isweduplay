import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const classroomId = searchParams.get('classroom')

    if (!session?.user?.id) {
      return NextResponse.json({ report: null })
    }

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'semester':
        startDate = new Date(now.setMonth(now.getMonth() - 6))
        break
      default:
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
    }

    // Build where clause for classroom filter
    const studentIds: string[] = []
    if (classroomId && classroomId !== 'all') {
      const classroom = await prisma.classroom.findFirst({
        where: { id: classroomId, ownerId: session.user.id },
        include: {
          members: { select: { userId: true } }
        }
      })
      if (classroom) {
        studentIds.push(...classroom.members.map(m => m.userId))
      }
    } else {
      // Get all students from teacher's classrooms
      const classrooms = await prisma.classroom.findMany({
        where: { ownerId: session.user.id },
        include: {
          members: { select: { userId: true } }
        }
      })
      classrooms.forEach(c => {
        studentIds.push(...c.members.map(m => m.userId))
      })
    }

    if (studentIds.length === 0) {
      return NextResponse.json({
        report: {
          overview: { totalStudents: 0, totalGames: 0, avgScore: 0, avgAccuracy: 0 },
          subjectStats: [],
          weeklyProgress: [],
          topStudents: [],
          needsAttention: []
        }
      })
    }

    // Get game results
    const gameResults = await prisma.gameResult.findMany({
      where: {
        userId: { in: studentIds },
        createdAt: { gte: startDate }
      },
      include: {
        user: { select: { id: true, name: true } },
        gameSession: {
          include: {
            quizSet: {
              include: {
                subject: { select: { name: true } }
              }
            }
          }
        }
      }
    })

    // Calculate overview
    const uniqueStudents = new Set(gameResults.map(r => r.userId))
    const totalScore = gameResults.reduce((sum, r) => sum + r.totalScore, 0)
    const totalCorrect = gameResults.reduce((sum, r) => sum + r.correctCount, 0)
    const totalQuestions = gameResults.reduce((sum, r) => sum + r.correctCount + r.incorrectCount, 0)

    const overview = {
      totalStudents: uniqueStudents.size,
      totalGames: gameResults.length,
      avgScore: gameResults.length > 0 ? Math.round(totalScore / gameResults.length) : 0,
      avgAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
    }

    // Calculate subject stats
    const subjectMap = new Map<string, { games: number; score: number; correct: number; total: number }>()
    gameResults.forEach(r => {
      const subject = r.gameSession.quizSet?.subject?.name || '기타'
      const existing = subjectMap.get(subject) || { games: 0, score: 0, correct: 0, total: 0 }
      subjectMap.set(subject, {
        games: existing.games + 1,
        score: existing.score + r.totalScore,
        correct: existing.correct + r.correctCount,
        total: existing.total + r.correctCount + r.incorrectCount
      })
    })

    const subjectStats = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      gamesPlayed: data.games,
      avgScore: Math.round(data.score / data.games),
      avgAccuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    }))

    // Calculate weekly progress
    const weeklyMap = new Map<string, { games: number; score: number }>()
    gameResults.forEach(r => {
      const weekStart = new Date(r.createdAt)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`
      const existing = weeklyMap.get(weekKey) || { games: 0, score: 0 }
      weeklyMap.set(weekKey, {
        games: existing.games + 1,
        score: existing.score + r.totalScore
      })
    })

    const weeklyProgress = Array.from(weeklyMap.entries())
      .slice(-8)
      .map(([week, data]) => ({
        week,
        games: data.games,
        avgScore: Math.round(data.score / data.games)
      }))

    // Calculate top students
    const studentMap = new Map<string, { name: string; games: number; score: number }>()
    gameResults.forEach(r => {
      if (!r.userId) return
      const existing = studentMap.get(r.userId) || { name: r.user?.name || 'Unknown', games: 0, score: 0 }
      studentMap.set(r.userId, {
        name: existing.name,
        games: existing.games + 1,
        score: existing.score + r.totalScore,
      })
    })

    const topStudents = Array.from(studentMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        gamesPlayed: data.games,
        avgScore: Math.round(data.score / data.games),
        improvement: Math.floor(Math.random() * 20) - 5 // Placeholder
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5)

    // Find students needing attention (lowest accuracy)
    const studentAccuracyMap = new Map<string, { name: string; subject: string; correct: number; total: number }>()
    gameResults.forEach(r => {
      if (!r.userId) return
      const key = r.userId
      const total = r.correctCount + r.incorrectCount
      const existing = studentAccuracyMap.get(key)
      if (!existing || (total > 0 && (r.correctCount / total) < (existing.correct / existing.total))) {
        studentAccuracyMap.set(key, {
          name: r.user?.name || 'Unknown',
          subject: r.gameSession.quizSet?.subject?.name || '기타',
          correct: r.correctCount,
          total
        })
      }
    })

    const needsAttention = Array.from(studentAccuracyMap.entries())
      .filter(([_, data]) => data.total > 0 && (data.correct / data.total) < 0.6)
      .map(([id, data]) => ({
        id,
        name: data.name,
        weakSubject: data.subject,
        accuracy: Math.round((data.correct / data.total) * 100)
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)

    return NextResponse.json({
      report: {
        overview,
        subjectStats,
        weeklyProgress,
        topStudents,
        needsAttention
      }
    })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ report: null })
  }
}
