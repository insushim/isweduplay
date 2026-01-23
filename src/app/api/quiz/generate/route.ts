import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  getGeminiModelForJSON,
  buildQuizPrompt,
  parseGeminiResponse,
  type QuizGenerationParams,
} from '@/lib/gemini'

const generateQuizSchema = z.object({
  // 성취기준 기반 생성
  achievementStandardId: z.string().optional(),
  achievementStandardCode: z.string().optional(),

  // 또는 자유 주제 생성
  topic: z.string().optional(),
  subject: z.string().optional(),
  gradeGroup: z.string().optional(), // "1-2", "3-4", "5-6", "중1" 등

  // 문제 설정
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  questionCount: z.number().min(1).max(30).default(10),
  questionTypes: z
    .array(
      z.enum([
        'MULTIPLE_CHOICE',
        'MULTIPLE_ANSWER',
        'TRUE_FALSE',
        'SHORT_ANSWER',
        'FILL_IN_BLANK',
        'MATCHING',
        'ORDERING',
        'DRAG_DROP',
        'IMAGE_CHOICE',
      ])
    )
    .default(['MULTIPLE_CHOICE']),
  bloomLevels: z
    .array(z.enum(['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE']))
    .optional(),
  includeExplanations: z.boolean().default(true),
  includeHints: z.boolean().default(false),

  // 저장 옵션
  saveToQuizSet: z.boolean().default(false),
  quizSetTitle: z.string().optional(),
  saveToDB: z.boolean().default(true), // 문제 은행에 저장 여부
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 선생님만 퀴즈 생성 가능
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '선생님만 퀴즈를 생성할 수 있습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = generateQuizSchema.parse(body)

    // 성취기준 정보 가져오기
    let achievementStandard = null
    let learningElements = null

    if (validatedData.achievementStandardId || validatedData.achievementStandardCode) {
      achievementStandard = await prisma.achievementStandard.findFirst({
        where: validatedData.achievementStandardId
          ? { id: validatedData.achievementStandardId }
          : { code: validatedData.achievementStandardCode },
        include: {
          curriculumArea: {
            include: {
              subject: true,
            },
          },
          learningElements: true,
        },
      })

      if (!achievementStandard) {
        return NextResponse.json(
          { error: '성취기준을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      learningElements = achievementStandard.learningElements
    }

    // 프롬프트 구성
    let prompt: string

    if (achievementStandard) {
      // 성취기준 기반 문제 생성
      const params: QuizGenerationParams = {
        achievementStandard: {
          code: achievementStandard.code,
          description: achievementStandard.description,
          gradeGroup: achievementStandard.gradeGroup,
          explanation: achievementStandard.explanation || undefined,
          teachingNotes: achievementStandard.teachingNotes || undefined,
        },
        learningElements: learningElements?.map((le) => ({
          name: le.name,
          keywords: le.keywords,
          vocabulary: le.vocabulary,
          misconceptions: le.misconceptions || undefined,
        })),
        questionCount: validatedData.questionCount,
        difficulty: validatedData.difficulty,
        questionTypes: validatedData.questionTypes,
        includeExplanations: validatedData.includeExplanations,
        includeHints: validatedData.includeHints,
        bloomLevels: validatedData.bloomLevels,
      }
      prompt = buildQuizPrompt(params)
    } else if (validatedData.topic) {
      // 자유 주제 기반 문제 생성
      prompt = buildFreeTopicPrompt(validatedData)
    } else {
      return NextResponse.json(
        { error: '성취기준 ID 또는 주제를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Gemini API 호출
    const model = getGeminiModelForJSON('gemini-2.0-flash')
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // 응답 파싱
    const generatedData = parseGeminiResponse<{
      questions: Array<{
        type: string
        bloomLevel?: string
        content: string
        options?: string[]
        answer: string
        answerExplanation?: string
        wrongAnswerExplanations?: Record<string, string>
        hint?: string
        difficulty?: number
        points?: number
        keywords?: string[]
        timeLimit?: number
      }>
    }>(responseText)

    if (!generatedData || !generatedData.questions) {
      // AI 생성 로그 기록 (실패)
      await prisma.aIGenerationLog.create({
        data: {
          userId: session.user.id,
          achievementStandardId: achievementStandard?.id,
          prompt,
          response: responseText,
          questionsGenerated: 0,
          model: 'gemini-2.0-flash',
          success: false,
          errorMessage: 'Failed to parse response',
        },
      })

      return NextResponse.json(
        { error: 'AI 응답을 파싱할 수 없습니다.' },
        { status: 500 }
      )
    }

    // 문제 데이터 정리
    const questions = generatedData.questions.map((q, index) => ({
      type: q.type,
      bloomLevel: q.bloomLevel || 'UNDERSTAND',
      content: q.content,
      options: q.options || [],
      answer: q.answer,
      answerExplanation: q.answerExplanation,
      wrongAnswerExplanation: q.wrongAnswerExplanations,
      hint: q.hint,
      difficulty: q.difficulty || Math.ceil((validatedData.difficulty === 'easy' ? 1 : validatedData.difficulty === 'medium' ? 3 : 5) * Math.random()),
      points: q.points || 100,
      tags: q.keywords || [],
      timeLimit: q.timeLimit || (validatedData.difficulty === 'easy' ? 45 : validatedData.difficulty === 'medium' ? 30 : 20),
      isAIGenerated: true,
      achievementStandardId: achievementStandard?.id,
    }))

    // DB에 문제 저장
    let savedQuestions: Awaited<ReturnType<typeof prisma.question.create>>[] = []
    if (validatedData.saveToDB) {
      savedQuestions = await Promise.all(
        questions.map(async (q) => {
          return prisma.question.create({
            data: {
              type: q.type as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILL_IN_BLANK' | 'MATCHING' | 'ORDERING' | 'MULTIPLE_ANSWER' | 'DRAG_DROP' | 'IMAGE_CHOICE',
              bloomLevel: q.bloomLevel as 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE',
              content: q.content,
              options: q.options,
              answer: q.answer,
              answerExplanation: q.answerExplanation,
              wrongAnswerExplanation: q.wrongAnswerExplanation,
              hint: q.hint,
              difficulty: q.difficulty,
              points: q.points,
              tags: q.tags,
              timeLimit: q.timeLimit,
              isAIGenerated: true,
              achievementStandardId: q.achievementStandardId,
            },
          })
        })
      )
    }

    // 퀴즈 세트 생성
    let quizSet = null
    if (validatedData.saveToQuizSet && savedQuestions.length > 0) {
      quizSet = await prisma.quizSet.create({
        data: {
          title:
            validatedData.quizSetTitle ||
            (achievementStandard
              ? `${achievementStandard.code} 문제`
              : `${validatedData.topic} 퀴즈`),
          description: achievementStandard
            ? `${achievementStandard.description} - AI 생성 문제`
            : `${validatedData.topic}에 관한 AI 생성 문제`,
          creatorId: session.user.id,
          subjectId: achievementStandard?.curriculumArea?.subjectId,
          gradeGroup:
            achievementStandard?.gradeGroup || validatedData.gradeGroup,
          isAIGenerated: true,
          tags: [
            validatedData.topic || achievementStandard?.code || '',
            validatedData.difficulty,
            'AI생성',
          ].filter(Boolean),
          questions: {
            create: savedQuestions.map((q, index) => ({
              questionId: q.id,
              order: index + 1,
            })),
          },
        },
        include: {
          questions: {
            include: {
              question: true,
            },
          },
        },
      })
    }

    // AI 생성 로그 기록 (성공)
    await prisma.aIGenerationLog.create({
      data: {
        userId: session.user.id,
        achievementStandardId: achievementStandard?.id,
        prompt,
        response: responseText,
        questionsGenerated: questions.length,
        model: 'gemini-2.0-flash',
        success: true,
      },
    })

    return NextResponse.json({
      success: true,
      questions: savedQuestions.length > 0 ? savedQuestions : questions,
      quizSet: quizSet
        ? {
            id: quizSet.id,
            title: quizSet.title,
            questionCount: quizSet.questions.length,
          }
        : null,
      metadata: {
        achievementStandard: achievementStandard
          ? {
              code: achievementStandard.code,
              description: achievementStandard.description,
              gradeGroup: achievementStandard.gradeGroup,
            }
          : null,
        topic: validatedData.topic,
        difficulty: validatedData.difficulty,
        questionCount: questions.length,
        generatedAt: new Date().toISOString(),
        model: 'gemini-2.0-flash',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Generate quiz error:', error)
    return NextResponse.json(
      { error: '퀴즈 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 자유 주제 프롬프트 생성
function buildFreeTopicPrompt(data: {
  topic?: string
  subject?: string
  gradeGroup?: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionCount: number
  questionTypes: string[]
  includeExplanations: boolean
  includeHints: boolean
  bloomLevels?: string[]
}): string {
  const difficultyKorean = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
  }[data.difficulty]

  return `당신은 대한민국 교육 전문가입니다.
다음 주제에 맞는 교육용 문제를 생성해주세요.

═══════════════════════════════════════════
📚 문제 주제
═══════════════════════════════════════════
주제: ${data.topic}
${data.subject ? `과목: ${data.subject}` : ''}
${data.gradeGroup ? `대상: ${data.gradeGroup} 학년` : ''}

═══════════════════════════════════════════
⚙️ 문제 생성 조건
═══════════════════════════════════════════
문제 수: ${data.questionCount}개
난이도: ${difficultyKorean}
문제 유형: ${data.questionTypes.join(', ')}
${data.bloomLevels?.length ? `인지 수준: ${data.bloomLevels.join(', ')}` : ''}

═══════════════════════════════════════════
📋 요구사항
═══════════════════════════════════════════
1. 교육적으로 가치 있는 문제
2. 명확하고 이해하기 쉬운 문장
3. 적절한 난이도 배분
${data.includeExplanations ? '4. 상세한 정답 해설 포함' : ''}
${data.includeHints ? '5. 힌트 포함' : ''}

═══════════════════════════════════════════
📤 출력 형식 (JSON)
═══════════════════════════════════════════
{
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "bloomLevel": "UNDERSTAND",
      "content": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": "정답 텍스트",
      "answerExplanation": "정답 해설",
      "wrongAnswerExplanations": {
        "선택지1": "오답인 이유",
        "선택지2": "오답인 이유"
      },
      "hint": "힌트",
      "difficulty": 1-5,
      "points": 100,
      "keywords": ["관련 키워드"],
      "timeLimit": 30
    }
  ]
}`
}
