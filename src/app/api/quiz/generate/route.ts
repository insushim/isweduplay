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
import { runExpertGenerationWorkflow } from '@/lib/quiz-generation/expert-workflow'

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

  // 전문가 모드 (고품질 문제 생성)
  expertMode: z.boolean().default(false),
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

    // 전문가 모드 또는 일반 모드로 문제 생성
    let questions: Array<{
      type: string
      bloomLevel: string
      content: string
      options: string[]
      answer: string
      answerExplanation?: string
      wrongAnswerExplanation?: Record<string, string>
      hint?: string
      difficulty: number
      points: number
      tags: string[]
      timeLimit: number
      isAIGenerated: boolean
      achievementStandardId?: string
      qualityScore?: number
      pedagogicalNotes?: string
    }> = []

    let expertMetadata = null

    if (validatedData.expertMode) {
      // 전문가 모드: 4단계 워크플로우로 고품질 문제 생성
      console.log('🎓 전문가 모드 활성화 - 고품질 문제 생성 워크플로우 시작')

      const expertResult = await runExpertGenerationWorkflow({
        topic: validatedData.topic || achievementStandard?.description || '',
        subject: validatedData.subject,
        gradeGroup: validatedData.gradeGroup || achievementStandard?.gradeGroup,
        difficulty: validatedData.difficulty,
        questionCount: validatedData.questionCount,
        questionTypes: validatedData.questionTypes,
        includeExplanations: validatedData.includeExplanations,
        includeHints: validatedData.includeHints,
        bloomLevels: validatedData.bloomLevels,
        achievementStandard: achievementStandard ? {
          code: achievementStandard.code,
          description: achievementStandard.description,
          gradeGroup: achievementStandard.gradeGroup,
          explanation: achievementStandard.explanation || undefined,
          teachingNotes: achievementStandard.teachingNotes || undefined,
        } : undefined,
        learningElements: learningElements?.map((le) => ({
          name: le.name,
          keywords: le.keywords,
          vocabulary: le.vocabulary,
          misconceptions: le.misconceptions || undefined,
        })),
      })

      expertMetadata = expertResult.metadata

      questions = expertResult.questions.map((q) => ({
        type: q.type,
        bloomLevel: q.bloomLevel || 'UNDERSTAND',
        content: q.content,
        options: q.options || [],
        answer: q.answer,
        answerExplanation: q.answerExplanation,
        wrongAnswerExplanation: q.wrongAnswerExplanations,
        hint: q.hint,
        difficulty: q.difficulty || 3,
        points: q.points || 100,
        tags: q.keywords || [],
        timeLimit: q.timeLimit || 30,
        isAIGenerated: true,
        achievementStandardId: achievementStandard?.id,
        qualityScore: q.qualityScore,
        pedagogicalNotes: q.pedagogicalNotes,
      }))

      // AI 생성 로그 기록 (전문가 모드)
      await prisma.aIGenerationLog.create({
        data: {
          userId: session.user.id,
          achievementStandardId: achievementStandard?.id,
          prompt: `[EXPERT MODE] topic: ${validatedData.topic}, count: ${validatedData.questionCount}`,
          response: JSON.stringify({ questionsGenerated: questions.length, expertMetadata }),
          questionsGenerated: questions.length,
          model: 'gemini-3-pro-preview (expert-workflow)',
          success: true,
        },
      })
    } else {
      // 일반 모드: 기존 단일 프롬프트 방식
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
      const model = getGeminiModelForJSON('gemini-3-pro-preview')
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
            model: 'gemini-3-pro-preview',
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
      questions = generatedData.questions.map((q) => ({
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

      // AI 생성 로그 기록 (성공 - 일반 모드)
      await prisma.aIGenerationLog.create({
        data: {
          userId: session.user.id,
          achievementStandardId: achievementStandard?.id,
          prompt,
          response: responseText,
          questionsGenerated: questions.length,
          model: 'gemini-3-pro-preview',
          success: true,
        },
      })
    }

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
              source: validatedData.expertMode ? 'AI Expert Mode' : 'AI Generated',
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
        model: validatedData.expertMode ? 'gemini-3-pro-preview (expert-workflow)' : 'gemini-3-pro-preview',
        expertMode: validatedData.expertMode,
        expertMetadata: expertMetadata,
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

  // 문제 유형별 예시 생성
  const typeExamples = data.questionTypes.map(type => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return `{
      "type": "MULTIPLE_CHOICE",
      "content": "문제 내용?",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": "정답 텍스트 (options 중 하나와 정확히 일치)",
      "answerExplanation": "정답 해설",
      "hint": "힌트",
      "difficulty": 3,
      "timeLimit": 30
    }`
      case 'TRUE_FALSE':
        return `{
      "type": "TRUE_FALSE",
      "content": "참/거짓 판단 문장",
      "options": ["O", "X"],
      "answer": "O 또는 X",
      "answerExplanation": "정답 해설",
      "hint": "힌트",
      "difficulty": 2,
      "timeLimit": 20
    }`
      case 'SHORT_ANSWER':
        return `{
      "type": "SHORT_ANSWER",
      "content": "단답형 문제?",
      "options": [],
      "answer": "정답 단어나 짧은 문장",
      "answerExplanation": "정답 해설",
      "hint": "힌트",
      "difficulty": 3,
      "timeLimit": 45
    }`
      case 'FILL_IN_BLANK':
        return `{
      "type": "FILL_IN_BLANK",
      "content": "문장에서 ___는 빈칸을 의미합니다. ___에 들어갈 말은?",
      "options": [],
      "answer": "빈칸 정답 (여러 개면 쉼표로 구분)",
      "answerExplanation": "정답 해설",
      "hint": "힌트",
      "difficulty": 3,
      "timeLimit": 40
    }`
      case 'ORDERING':
        return `{
      "type": "ORDERING",
      "content": "다음을 올바른 순서로 나열하세요",
      "options": ["순서1", "순서2", "순서3", "순서4"],
      "answer": "순서1 → 순서2 → 순서3 → 순서4",
      "answerExplanation": "정답 해설",
      "hint": "힌트",
      "difficulty": 4,
      "timeLimit": 60
    }`
      case 'MATCHING':
        return `{
      "type": "MATCHING",
      "content": "왼쪽과 오른쪽을 알맞게 연결하세요",
      "options": ["왼쪽1", "오른쪽1", "왼쪽2", "오른쪽2", "왼쪽3", "오른쪽3"],
      "answer": "왼쪽1=오른쪽1, 왼쪽2=오른쪽2, 왼쪽3=오른쪽3",
      "answerExplanation": "정답 해설",
      "hint": "힌트",
      "difficulty": 4,
      "timeLimit": 60
    }`
      default:
        return ''
    }
  }).filter(Boolean).join(',\n    ')

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
📋 문제 유형별 형식
═══════════════════════════════════════════
- MULTIPLE_CHOICE: 4지선다 객관식, options에 4개 선택지, answer는 options 중 하나
- TRUE_FALSE: OX 퀴즈, options는 ["O", "X"], answer는 "O" 또는 "X"
- SHORT_ANSWER: 단답형, options는 빈 배열 [], answer는 짧은 텍스트
- FILL_IN_BLANK: 빈칸 채우기, content에 ___로 빈칸 표시, answer는 빈칸 정답
- ORDERING: 순서 맞추기, options에 섞인 항목들, answer는 "1 → 2 → 3" 형식
- MATCHING: 짝 맞추기, options는 [왼1, 오1, 왼2, 오2...] 교대로, answer는 "왼1=오1, 왼2=오2" 형식

═══════════════════════════════════════════
📋 요구사항
═══════════════════════════════════════════
1. 교육적으로 가치 있는 문제
2. 명확하고 이해하기 쉬운 문장
3. 적절한 난이도 배분
4. 요청된 문제 유형들을 골고루 사용
${data.includeExplanations ? '5. 상세한 정답 해설 포함' : ''}
${data.includeHints ? '6. 힌트 포함' : ''}

═══════════════════════════════════════════
📤 출력 형식 (JSON)
═══════════════════════════════════════════
{
  "questions": [
    ${typeExamples}
  ]
}

위 예시 형식을 참고하여 ${data.questionCount}개의 문제를 생성하세요.`
}
