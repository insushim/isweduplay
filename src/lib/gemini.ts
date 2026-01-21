import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Gemini 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// 안전 설정
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// 모델 인스턴스 생성
export function getGeminiModel(modelName: string = 'gemini-2.0-flash') {
  return genAI.getGenerativeModel({
    model: modelName,
    safetySettings,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  })
}

// JSON 응답을 위한 모델
export function getGeminiModelForJSON(modelName: string = 'gemini-2.0-flash') {
  return genAI.getGenerativeModel({
    model: modelName,
    safetySettings,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  })
}

// 문제 생성 프롬프트 빌더
export interface QuizGenerationParams {
  achievementStandard: {
    code: string
    description: string
    gradeGroup: string
    explanation?: string
    teachingNotes?: string
  }
  learningElements?: {
    name: string
    keywords: string[]
    vocabulary: string[]
    misconceptions?: unknown
  }[]
  questionCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  questionTypes: string[]
  includeExplanations: boolean
  includeHints: boolean
  bloomLevels?: string[]
}

export function buildQuizPrompt(params: QuizGenerationParams): string {
  const {
    achievementStandard,
    learningElements,
    questionCount,
    difficulty,
    questionTypes,
    includeExplanations,
    includeHints,
    bloomLevels,
  } = params

  const difficultyKorean = {
    easy: '쉬움 (기본 개념 이해 확인)',
    medium: '보통 (개념 적용 및 문제 해결)',
    hard: '어려움 (심화 사고력 및 복합 문제)',
  }[difficulty]

  const bloomLevelDesc = bloomLevels?.length
    ? `\n인지 수준: ${bloomLevels.join(', ')}`
    : ''

  const typeInstructions = questionTypes
    .map((type) => {
      switch (type) {
        case 'MULTIPLE_CHOICE':
          return '- 객관식(4지선다): 정답 1개, 매력적인 오답 3개'
        case 'TRUE_FALSE':
          return '- OX 퀴즈: 명확한 참/거짓 진술'
        case 'SHORT_ANSWER':
          return '- 단답형: 1-3단어 답변'
        case 'FILL_IN_BLANK':
          return '- 빈칸 채우기: 핵심 개념이 빈칸으로'
        case 'MATCHING':
          return '- 연결하기: 관련 개념 짝짓기'
        case 'ORDERING':
          return '- 순서 배열: 논리적/시간적 순서'
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join('\n')

  const learningElementsInfo = learningElements?.length
    ? `
학습 요소:
${learningElements
  .map(
    (le) => `
- ${le.name}
  키워드: ${le.keywords.join(', ')}
  핵심어휘: ${le.vocabulary.join(', ')}
  ${le.misconceptions ? `오개념 주의: ${JSON.stringify(le.misconceptions)}` : ''}
`
  )
  .join('')}`
    : ''

  return `당신은 대한민국 2022 개정 교육과정 전문가입니다.
아래 성취기준에 맞는 교육용 문제를 생성해주세요.

═══════════════════════════════════════════
📚 성취기준 정보
═══════════════════════════════════════════
성취기준 코드: ${achievementStandard.code}
학년군: ${achievementStandard.gradeGroup}
성취기준: ${achievementStandard.description}
${achievementStandard.explanation ? `해설: ${achievementStandard.explanation}` : ''}
${achievementStandard.teachingNotes ? `교수학습 유의사항: ${achievementStandard.teachingNotes}` : ''}
${learningElementsInfo}

═══════════════════════════════════════════
⚙️ 문제 생성 조건
═══════════════════════════════════════════
문제 수: ${questionCount}개
난이도: ${difficultyKorean}${bloomLevelDesc}

문제 유형:
${typeInstructions}

═══════════════════════════════════════════
📋 요구사항
═══════════════════════════════════════════
1. 2022 개정 교육과정의 성취기준에 정확히 부합하는 문제
2. 해당 학년군 수준에 적합한 어휘와 표현 사용
3. 실생활 맥락이나 교과 통합적 요소 반영
4. 오개념을 유도하지 않는 명확한 문항
${includeExplanations ? '5. 정답에 대한 상세하고 교육적인 해설 포함' : ''}
${includeExplanations ? '6. 오답인 경우 왜 틀린지 설명 포함' : ''}
${includeHints ? '7. 문제 해결에 도움이 되는 힌트 포함' : ''}

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
}

※ OX 퀴즈: options는 ["O", "X"], answer는 "O" 또는 "X"
※ 단답형: options는 빈 배열 []
※ bloomLevel: REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE 중 선택`
}

// 문제 검증 프롬프트
export function buildValidationPrompt(
  question: {
    content: string
    options?: string[]
    answer: string
    type: string
  },
  achievementStandard: {
    code: string
    description: string
    gradeGroup: string
  }
): string {
  return `다음 문제가 2022 개정 교육과정의 성취기준에 적합한지 검증해주세요.

성취기준: ${achievementStandard.code}
내용: ${achievementStandard.description}
학년군: ${achievementStandard.gradeGroup}

문제:
유형: ${question.type}
내용: ${question.content}
${question.options?.length ? `선택지: ${question.options.join(', ')}` : ''}
정답: ${question.answer}

검증 항목:
1. 성취기준 부합 여부 (0-100)
2. 학년 수준 적합성 (0-100)
3. 문항 명확성 (0-100)
4. 정답 정확성 (0-100)
5. 교육적 가치 (0-100)

JSON 형식으로 응답:
{
  "isValid": true/false,
  "scores": {
    "achievementFit": 점수,
    "gradeLevelFit": 점수,
    "clarity": 점수,
    "answerAccuracy": 점수,
    "educationalValue": 점수
  },
  "totalScore": 평균점수,
  "feedback": "피드백 내용",
  "suggestions": ["개선 제안1", "개선 제안2"]
}`
}

// 힌트 생성 프롬프트
export function buildHintPrompt(
  question: {
    content: string
    options?: string[]
    answer: string
    type: string
  },
  difficulty: number
): string {
  return `다음 문제에 대한 힌트를 ${difficulty} 단계로 생성해주세요.

문제: ${question.content}
${question.options?.length ? `선택지: ${question.options.join(', ')}` : ''}
정답: ${question.answer}

힌트 단계:
1단계: 아주 간접적인 힌트
2단계: 방향을 알려주는 힌트
3단계: 거의 답에 가까운 힌트

JSON 형식:
{
  "hints": [
    { "level": 1, "text": "힌트1" },
    { "level": 2, "text": "힌트2" },
    { "level": 3, "text": "힌트3" }
  ]
}`
}

// 응답 파싱
export function parseGeminiResponse<T>(responseText: string): T | null {
  try {
    // JSON 블록 추출
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T
    }

    // 직접 JSON 파싱 시도
    return JSON.parse(responseText) as T
  } catch (error) {
    console.error('Failed to parse Gemini response:', error)
    return null
  }
}
