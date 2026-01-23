import { PrismaClient } from '@prisma/client'
import { GoogleGenerativeAI } from '@google/generative-ai'

const prisma = new PrismaClient()

async function testQuizGeneration() {
  console.log('=== 퀴즈 생성 API 테스트 ===\n')

  // 1. Gemini API 키 확인
  const apiKey = process.env.GEMINI_API_KEY
  console.log('1. Gemini API Key:', apiKey ? `${apiKey.slice(0, 10)}...` : 'NOT SET')

  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY가 설정되지 않았습니다!')
    return
  }

  // 2. 성취기준 조회 테스트
  console.log('\n2. 성취기준 조회 테스트...')
  try {
    const standard = await prisma.achievementStandard.findFirst({
      where: { code: '[4수01-01]' },
      include: {
        curriculumArea: {
          include: { subject: true }
        },
        learningElements: true
      }
    })

    if (standard) {
      console.log('   성취기준 찾음:', standard.code)
      console.log('   설명:', standard.description?.slice(0, 50) + '...')
      console.log('   학습요소:', standard.learningElements?.length || 0, '개')
    } else {
      console.log('   성취기준을 찾을 수 없습니다. 다른 코드 시도...')

      // 다른 성취기준 찾기
      const anyStandard = await prisma.achievementStandard.findFirst({
        include: {
          curriculumArea: { include: { subject: true } },
          learningElements: true
        }
      })

      if (anyStandard) {
        console.log('   대체 성취기준:', anyStandard.code)
      } else {
        console.log('   ERROR: DB에 성취기준이 없습니다!')
        return
      }
    }
  } catch (error) {
    console.error('   DB 조회 에러:', error)
    return
  }

  // 3. Gemini API 테스트
  console.log('\n3. Gemini API 연결 테스트...')
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    })

    const testPrompt = `다음 JSON 형식으로 간단한 수학 문제 1개를 생성해주세요:
{
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "content": "문제",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": "정답"
    }
  ]
}`

    console.log('   Gemini 호출 중...')
    const result = await model.generateContent(testPrompt)
    const responseText = result.response.text()

    console.log('   응답 받음!')
    console.log('   응답 길이:', responseText.length, '자')

    // JSON 파싱 테스트
    const parsed = JSON.parse(responseText)
    console.log('   JSON 파싱 성공!')
    console.log('   생성된 문제 수:', parsed.questions?.length || 0)

    if (parsed.questions?.[0]) {
      console.log('\n   생성된 문제 예시:')
      console.log('   ', parsed.questions[0].content)
    }

  } catch (error: unknown) {
    console.error('   Gemini API 에러:', error)
    if (error instanceof Error && error.message) {
      console.error('   에러 메시지:', error.message)
    }
    return
  }

  console.log('\n=== 모든 테스트 통과! ===')

  await prisma.$disconnect()
}

testQuizGeneration().catch(console.error)
