'use server'

import { getGeminiModelForJSON, parseGeminiResponse } from '@/lib/gemini'

/**
 * 전문가 수준 문제 생성 워크플로우
 *
 * 교육 전문가들의 문제 출제 과정을 반영:
 * 1. 학습 목표 분석 (Learning Objectives Analysis)
 * 2. 내용 영역 매핑 (Content Domain Mapping)
 * 3. 문제 설계 (Item Design)
 * 4. 오답 설계 (Distractor Design)
 * 5. 품질 검증 (Quality Assurance)
 * 6. 난이도 조정 (Difficulty Calibration)
 */

export interface ExpertGenerationParams {
  topic: string
  subject?: string
  gradeGroup?: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionCount: number
  questionTypes: string[]
  includeExplanations: boolean
  includeHints: boolean
  bloomLevels?: string[]
  achievementStandard?: {
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
}

export interface GeneratedQuestion {
  type: string
  bloomLevel: string
  content: string
  options: string[]
  answer: string
  answerExplanation?: string
  wrongAnswerExplanations?: Record<string, string>
  hint?: string
  difficulty: number
  points: number
  keywords: string[]
  timeLimit: number
  qualityScore?: number
  pedagogicalNotes?: string
}

export interface ExpertGenerationResult {
  questions: GeneratedQuestion[]
  metadata: {
    learningObjectives: string[]
    contentDomains: string[]
    cognitiveDistribution: Record<string, number>
    difficultyDistribution: Record<string, number>
    qualityMetrics: {
      averageScore: number
      coverageScore: number
      balanceScore: number
    }
  }
}

/**
 * Phase 1: 학습 목표 분석
 * 주제를 분석하여 핵심 학습 목표와 하위 개념을 도출
 */
async function analyzeLearningObjectives(params: ExpertGenerationParams): Promise<{
  mainObjectives: string[]
  subConcepts: string[]
  prerequisiteKnowledge: string[]
  commonMisconceptions: string[]
  realWorldConnections: string[]
}> {
  const model = getGeminiModelForJSON('gemini-3-pro-preview')

  const prompt = `당신은 교육과정 분석 전문가입니다.
다음 주제에 대한 학습 목표를 체계적으로 분석해주세요.

═══════════════════════════════════════════
📚 분석 대상
═══════════════════════════════════════════
주제: ${params.topic}
${params.subject ? `과목: ${params.subject}` : ''}
${params.gradeGroup ? `학년군: ${params.gradeGroup}` : ''}
${params.achievementStandard ? `
성취기준 코드: ${params.achievementStandard.code}
성취기준: ${params.achievementStandard.description}
${params.achievementStandard.explanation ? `해설: ${params.achievementStandard.explanation}` : ''}
` : ''}

═══════════════════════════════════════════
📋 분석 요청 사항
═══════════════════════════════════════════
1. 핵심 학습 목표 3-5개 도출
2. 세부 하위 개념 5-8개 파악
3. 선수 지식 요소 파악
4. 학생들이 흔히 갖는 오개념 파악
5. 실생활 연계 요소 파악

═══════════════════════════════════════════
📤 출력 형식 (JSON)
═══════════════════════════════════════════
{
  "mainObjectives": ["핵심 학습 목표 1", "핵심 학습 목표 2", ...],
  "subConcepts": ["하위 개념 1", "하위 개념 2", ...],
  "prerequisiteKnowledge": ["선수 지식 1", "선수 지식 2", ...],
  "commonMisconceptions": ["오개념 1", "오개념 2", ...],
  "realWorldConnections": ["실생활 연계 1", "실생활 연계 2", ...]
}`

  const result = await model.generateContent(prompt)
  const response = parseGeminiResponse<{
    mainObjectives: string[]
    subConcepts: string[]
    prerequisiteKnowledge: string[]
    commonMisconceptions: string[]
    realWorldConnections: string[]
  }>(result.response.text())

  return response || {
    mainObjectives: [params.topic],
    subConcepts: [],
    prerequisiteKnowledge: [],
    commonMisconceptions: [],
    realWorldConnections: []
  }
}

/**
 * Phase 2: 문제 유형별 청사진 설계
 * 블룸 인지 수준과 문제 유형을 고려한 문제 설계 청사진 생성
 */
async function designItemBlueprint(
  params: ExpertGenerationParams,
  learningAnalysis: Awaited<ReturnType<typeof analyzeLearningObjectives>>
): Promise<{
  items: Array<{
    questionType: string
    bloomLevel: string
    targetConcept: string
    cognitiveTask: string
    expectedDifficulty: number
    timeAllocation: number
  }>
}> {
  const model = getGeminiModelForJSON('gemini-3-pro-preview')

  const bloomDistribution = getBloomDistribution(params.difficulty, params.bloomLevels)

  const prompt = `당신은 문항 설계 전문가입니다.
다음 학습 분석 결과를 바탕으로 ${params.questionCount}개 문제의 청사진을 설계해주세요.

═══════════════════════════════════════════
📚 학습 분석 결과
═══════════════════════════════════════════
핵심 학습 목표:
${learningAnalysis.mainObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

하위 개념:
${learningAnalysis.subConcepts.map((con, i) => `- ${con}`).join('\n')}

흔한 오개념:
${learningAnalysis.commonMisconceptions.map((mis, i) => `- ${mis}`).join('\n')}

실생활 연계:
${learningAnalysis.realWorldConnections.map((con, i) => `- ${con}`).join('\n')}

═══════════════════════════════════════════
⚙️ 설계 조건
═══════════════════════════════════════════
총 문제 수: ${params.questionCount}개
난이도: ${params.difficulty}
사용 가능한 문제 유형: ${params.questionTypes.join(', ')}

블룸 인지 수준 배분:
${Object.entries(bloomDistribution).map(([level, ratio]) => `- ${level}: ${ratio}%`).join('\n')}

═══════════════════════════════════════════
📋 설계 원칙
═══════════════════════════════════════════
1. 학습 목표와 하위 개념을 골고루 평가
2. 인지 수준의 적절한 배분 (기억 → 창조)
3. 문제 유형의 다양성 확보
4. 난이도의 점진적 상승
5. 오개념을 진단할 수 있는 문항 포함
6. 실생활 맥락 적용 문항 포함

═══════════════════════════════════════════
📤 출력 형식 (JSON)
═══════════════════════════════════════════
{
  "items": [
    {
      "questionType": "MULTIPLE_CHOICE",
      "bloomLevel": "UNDERSTAND",
      "targetConcept": "평가할 개념",
      "cognitiveTask": "학생이 수행할 인지 과제 설명",
      "expectedDifficulty": 1-5,
      "timeAllocation": 초 단위
    }
  ]
}`

  const result = await model.generateContent(prompt)
  const response = parseGeminiResponse<{
    items: Array<{
      questionType: string
      bloomLevel: string
      targetConcept: string
      cognitiveTask: string
      expectedDifficulty: number
      timeAllocation: number
    }>
  }>(result.response.text())

  return response || { items: [] }
}

/**
 * Phase 3: 고품질 문제 생성
 * 청사진을 기반으로 전문가 수준의 문제 생성
 */
async function generateExpertQuestions(
  params: ExpertGenerationParams,
  learningAnalysis: Awaited<ReturnType<typeof analyzeLearningObjectives>>,
  blueprint: Awaited<ReturnType<typeof designItemBlueprint>>
): Promise<GeneratedQuestion[]> {
  const model = getGeminiModelForJSON('gemini-3-pro-preview')

  const prompt = `당신은 20년 경력의 교육평가 전문가입니다.
다음 설계 청사진에 따라 최고 품질의 교육용 문제를 생성해주세요.

═══════════════════════════════════════════
📚 문제 설계 청사진
═══════════════════════════════════════════
${blueprint.items.map((item, i) => `
[문제 ${i + 1}]
- 유형: ${item.questionType}
- 블룸 수준: ${item.bloomLevel}
- 평가 개념: ${item.targetConcept}
- 인지 과제: ${item.cognitiveTask}
- 목표 난이도: ${item.expectedDifficulty}/5
- 제한 시간: ${item.timeAllocation}초
`).join('\n')}

═══════════════════════════════════════════
📚 참고 정보
═══════════════════════════════════════════
주제: ${params.topic}
${params.subject ? `과목: ${params.subject}` : ''}
${params.gradeGroup ? `대상: ${params.gradeGroup}` : ''}

흔한 오개념 (오답 설계 시 활용):
${learningAnalysis.commonMisconceptions.map(m => `- ${m}`).join('\n')}

실생활 연계 (문제 맥락 설정 시 활용):
${learningAnalysis.realWorldConnections.map(r => `- ${r}`).join('\n')}

═══════════════════════════════════════════
📋 전문가 문제 작성 원칙
═══════════════════════════════════════════

【문두 작성 원칙】
1. 명확하고 구체적인 질문
2. 불필요한 부정문 지양 (특히 이중부정)
3. 학년 수준에 맞는 어휘 사용
4. 핵심 개념을 직접 묻기

【선택지 작성 원칙】
5. 모든 선택지의 길이와 형식 통일
6. 문법적으로 일관된 형태
7. "모두 정답" "정답 없음" 지양
8. 명확한 오답 (그럴듯하지만 틀린 것)

【오답(매력적 오답) 설계 원칙】
9. 흔한 오개념을 반영한 오답
10. 부주의한 계산/읽기 실수 유도 오답
11. 부분적 이해만 있을 때 선택할 오답
12. 각 오답이 진단적 가치를 가짐

【해설 작성 원칙】
13. 왜 정답인지 논리적 설명
14. 각 오답이 왜 틀린지 개별 설명
15. 관련 개념의 추가 학습 안내
16. 비슷한 문제 해결 전략 제시

【난이도 조절 원칙】
17. 쉬움: 직접적 기억/이해 확인
18. 보통: 개념 적용 및 간단한 추론
19. 어려움: 복합 개념, 심층 분석 필요

═══════════════════════════════════════════
📤 출력 형식 (JSON)
═══════════════════════════════════════════
{
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "bloomLevel": "UNDERSTAND",
      "content": "전문적으로 작성된 문제 내용",
      "options": ["선택지A", "선택지B", "선택지C", "선택지D"],
      "answer": "정답 선택지 텍스트",
      "answerExplanation": "정답인 이유에 대한 상세하고 교육적인 해설",
      "wrongAnswerExplanations": {
        "선택지A": "이 선택지가 오답인 이유와 이것을 선택한 학생의 오개념",
        "선택지B": "이 선택지가 오답인 이유와 이것을 선택한 학생의 오개념"
      },
      "hint": "정답을 향한 사고 방향을 안내하는 힌트",
      "difficulty": 1-5,
      "points": 100,
      "keywords": ["관련 핵심어"],
      "timeLimit": 초,
      "pedagogicalNotes": "이 문제의 교육적 의도와 평가 목적"
    }
  ]
}

═══════════════════════════════════════════
📝 문제 유형별 상세 지침
═══════════════════════════════════════════

【MULTIPLE_CHOICE - 4지선다】
- options: 4개의 선택지 (균등한 길이)
- answer: options 중 하나와 정확히 일치
- 매력적 오답 3개 포함

【TRUE_FALSE - OX 퀴즈】
- options: ["O", "X"]
- answer: "O" 또는 "X"
- 명확하게 참/거짓 판단 가능한 진술

【SHORT_ANSWER - 단답형】
- options: [] (빈 배열)
- answer: 1-3단어의 핵심 답
- 다양한 표현의 정답도 인정될 수 있게

【FILL_IN_BLANK - 빈칸 채우기】
- content에 ___로 빈칸 표시
- options: [] (빈 배열)
- answer: 빈칸에 들어갈 정답

【ORDERING - 순서 배열】
- options: 섞인 순서의 항목들
- answer: "첫째|||둘째|||셋째|||넷째" (|||로 구분)
- 논리적/시간적 순서를 묻는 문제

【MATCHING - 짝 맞추기】
- options: [왼쪽1, 오른쪽1, 왼쪽2, 오른쪽2, ...] 교대로
- answer: "왼쪽1=오른쪽1|||왼쪽2=오른쪽2" (|||로 구분)
- 명확한 1:1 대응 관계`

  const result = await model.generateContent(prompt)
  const response = parseGeminiResponse<{ questions: GeneratedQuestion[] }>(result.response.text())

  return response?.questions || []
}

/**
 * Phase 4: 품질 검증 및 개선
 * 생성된 문제의 품질을 검증하고 필요시 개선
 */
async function validateAndImproveQuestions(
  questions: GeneratedQuestion[],
  params: ExpertGenerationParams
): Promise<GeneratedQuestion[]> {
  const model = getGeminiModelForJSON('gemini-3-pro-preview')

  const prompt = `당신은 교육평가 품질관리(QA) 전문가입니다.
다음 문제들의 품질을 검증하고 개선해주세요.

═══════════════════════════════════════════
📚 검증 대상 문제
═══════════════════════════════════════════
${questions.map((q, i) => `
[문제 ${i + 1}]
유형: ${q.type}
내용: ${q.content}
${q.options?.length ? `선택지: ${q.options.join(' | ')}` : ''}
정답: ${q.answer}
해설: ${q.answerExplanation || '없음'}
`).join('\n---\n')}

═══════════════════════════════════════════
📋 품질 검증 체크리스트
═══════════════════════════════════════════

【필수 검증 항목】
□ 문제가 명확하고 이해하기 쉬운가?
□ 정답이 명확하고 논쟁의 여지가 없는가?
□ 오답이 매력적이면서도 명확히 틀린가?
□ 학년 수준에 적합한 어휘를 사용했는가?
□ 문법적 오류가 없는가?
□ 편향되거나 불공정한 내용이 없는가?

【개선이 필요한 경우】
- 모호한 표현 → 명확하게 수정
- 이중부정 → 긍정문으로 변경
- 너무 쉬움/어려움 → 난이도 조절
- 오답이 너무 명확 → 매력적 오답으로 교체
- 해설 부족 → 상세한 해설 추가

═══════════════════════════════════════════
📤 출력 형식 (JSON)
═══════════════════════════════════════════
{
  "questions": [
    {
      "type": "원본 유지 또는 수정",
      "bloomLevel": "원본 유지 또는 수정",
      "content": "검증/개선된 문제 내용",
      "options": ["검증/개선된 선택지"],
      "answer": "검증된 정답",
      "answerExplanation": "보강된 해설",
      "wrongAnswerExplanations": {
        "오답1": "보강된 오답 해설"
      },
      "hint": "힌트",
      "difficulty": 1-5,
      "points": 100,
      "keywords": ["키워드"],
      "timeLimit": 초,
      "qualityScore": 1-100,
      "pedagogicalNotes": "교육적 의도"
    }
  ]
}`

  const result = await model.generateContent(prompt)
  const response = parseGeminiResponse<{ questions: GeneratedQuestion[] }>(result.response.text())

  return response?.questions || questions
}

/**
 * 블룸 인지 수준 배분 계산
 */
function getBloomDistribution(
  difficulty: 'easy' | 'medium' | 'hard',
  customLevels?: string[]
): Record<string, number> {
  if (customLevels?.length) {
    const ratio = Math.floor(100 / customLevels.length)
    return customLevels.reduce((acc, level) => {
      acc[level] = ratio
      return acc
    }, {} as Record<string, number>)
  }

  switch (difficulty) {
    case 'easy':
      return {
        REMEMBER: 40,
        UNDERSTAND: 40,
        APPLY: 20
      }
    case 'medium':
      return {
        REMEMBER: 20,
        UNDERSTAND: 30,
        APPLY: 30,
        ANALYZE: 20
      }
    case 'hard':
      return {
        UNDERSTAND: 20,
        APPLY: 25,
        ANALYZE: 30,
        EVALUATE: 15,
        CREATE: 10
      }
  }
}

/**
 * 메인 워크플로우 실행
 */
export async function runExpertGenerationWorkflow(
  params: ExpertGenerationParams
): Promise<ExpertGenerationResult> {
  console.log('📚 Phase 1: 학습 목표 분석 시작...')
  const learningAnalysis = await analyzeLearningObjectives(params)

  console.log('📐 Phase 2: 문제 청사진 설계 시작...')
  const blueprint = await designItemBlueprint(params, learningAnalysis)

  console.log('✍️ Phase 3: 전문가 수준 문제 생성 시작...')
  const rawQuestions = await generateExpertQuestions(params, learningAnalysis, blueprint)

  console.log('✅ Phase 4: 품질 검증 및 개선 시작...')
  const validatedQuestions = await validateAndImproveQuestions(rawQuestions, params)

  // 메타데이터 계산
  const cognitiveDistribution: Record<string, number> = {}
  const difficultyDistribution: Record<string, number> = {}
  let totalQuality = 0

  validatedQuestions.forEach(q => {
    cognitiveDistribution[q.bloomLevel] = (cognitiveDistribution[q.bloomLevel] || 0) + 1
    const diffKey = q.difficulty <= 2 ? 'easy' : q.difficulty <= 4 ? 'medium' : 'hard'
    difficultyDistribution[diffKey] = (difficultyDistribution[diffKey] || 0) + 1
    totalQuality += q.qualityScore || 80
  })

  return {
    questions: validatedQuestions,
    metadata: {
      learningObjectives: learningAnalysis.mainObjectives,
      contentDomains: learningAnalysis.subConcepts,
      cognitiveDistribution,
      difficultyDistribution,
      qualityMetrics: {
        averageScore: validatedQuestions.length > 0 ? totalQuality / validatedQuestions.length : 0,
        coverageScore: Math.min(100, (learningAnalysis.subConcepts.length / 5) * 100),
        balanceScore: calculateBalanceScore(cognitiveDistribution)
      }
    }
  }
}

function calculateBalanceScore(distribution: Record<string, number>): number {
  const values = Object.values(distribution)
  if (values.length === 0) return 0
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
  return Math.max(0, 100 - variance * 10)
}
