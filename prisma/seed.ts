import { PrismaClient, SchoolLevel, AchievementCategory, Rarity } from '@prisma/client'
import { koreanStandards } from './seeds/korean-standards'
import { mathStandards } from './seeds/math-standards'
import { englishStandards } from './seeds/english-standards'
import { socialStandards } from './seeds/social-standards'
import { scienceStandards } from './seeds/science-standards'
import type { SubjectStandardsData } from './seeds/index'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with 2022 개정 교육과정 data...')

  // 기존 데이터 삭제
  console.log('Clearing existing data...')
  await prisma.userAchievement.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.question.deleteMany()
  await prisma.quizSetQuestion.deleteMany()
  await prisma.quizSet.deleteMany()
  await prisma.learningElement.deleteMany()
  await prisma.achievementStandard.deleteMany()
  await prisma.contentElement.deleteMany()
  await prisma.curriculumArea.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.levelConfig.deleteMany()

  // ==================== 레벨 설정 ====================
  console.log('Creating level configs...')
  const levels = []
  for (let i = 1; i <= 100; i++) {
    const requiredExp = Math.floor(100 * i * i + 50 * i)
    levels.push({
      level: i,
      requiredExp,
      title: getLevelTitle(i),
      bonusMultiplier: 1 + (i - 1) * 0.02,
    })
  }
  await prisma.levelConfig.createMany({ data: levels })

  // ==================== 업적 시스템 ====================
  console.log('Creating achievements...')
  await createAchievements()

  // ==================== 초등학교 교과목 (2022 개정 교육과정) ====================
  console.log('Creating elementary subjects with 2022 curriculum standards...')
  await createElementarySubjectsWithStandards()

  // ==================== 중학교 교과목 ====================
  console.log('Creating middle school subjects...')
  await createMiddleSchoolSubjects()

  // ==================== 샘플 문제 생성 ====================
  console.log('Creating sample questions...')
  await createSampleQuestions()

  console.log('✅ Seeding completed!')
}

function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: '새싹 학습자',
    5: '초보 탐험가',
    10: '열정 학생',
    15: '성실한 학습자',
    20: '지식 탐구자',
    25: '학습 마스터',
    30: '지혜의 수호자',
    40: '학문의 달인',
    50: '교육 챔피언',
    60: '지식의 현자',
    70: '학습 전설',
    80: '불멸의 학자',
    90: '궁극의 마스터',
    100: '교육의 신',
  }

  for (let i = level; i >= 1; i--) {
    if (titles[i]) return titles[i]
  }
  return '학습자'
}

async function createAchievements() {
  const achievements = [
    // 게임 관련
    { code: 'FIRST_GAME', name: '첫 게임', description: '첫 번째 게임을 플레이했어요!', category: AchievementCategory.GAME, points: 10, rarity: Rarity.COMMON, requirement: { type: 'games_played', count: 1 } },
    { code: 'GAME_10', name: '게임 마니아', description: '10번의 게임을 플레이했어요!', category: AchievementCategory.GAME, points: 50, rarity: Rarity.COMMON, requirement: { type: 'games_played', count: 10 } },
    { code: 'GAME_50', name: '게임 전문가', description: '50번의 게임을 플레이했어요!', category: AchievementCategory.GAME, points: 100, rarity: Rarity.RARE, requirement: { type: 'games_played', count: 50 } },
    { code: 'GAME_100', name: '게임 마스터', description: '100번의 게임을 플레이했어요!', category: AchievementCategory.GAME, points: 200, rarity: Rarity.EPIC, requirement: { type: 'games_played', count: 100 } },
    { code: 'WIN_FIRST', name: '첫 승리', description: '첫 번째 1등을 했어요!', category: AchievementCategory.GAME, points: 20, rarity: Rarity.COMMON, requirement: { type: 'games_won', count: 1 } },
    { code: 'WIN_10', name: '승리의 맛', description: '10번 1등을 했어요!', category: AchievementCategory.GAME, points: 100, rarity: Rarity.RARE, requirement: { type: 'games_won', count: 10 } },
    { code: 'WIN_50', name: '무적 챔피언', description: '50번 1등을 했어요!', category: AchievementCategory.GAME, points: 300, rarity: Rarity.LEGENDARY, requirement: { type: 'games_won', count: 50 } },

    // 연속 정답
    { code: 'STREAK_5', name: '연속 5문제', description: '5문제 연속 정답!', category: AchievementCategory.STREAK, points: 30, rarity: Rarity.COMMON, requirement: { type: 'streak', count: 5 } },
    { code: 'STREAK_10', name: '연속 10문제', description: '10문제 연속 정답!', category: AchievementCategory.STREAK, points: 80, rarity: Rarity.RARE, requirement: { type: 'streak', count: 10 } },
    { code: 'STREAK_20', name: '연속 20문제', description: '20문제 연속 정답!', category: AchievementCategory.STREAK, points: 200, rarity: Rarity.EPIC, requirement: { type: 'streak', count: 20 } },
    { code: 'PERFECT_GAME', name: '퍼펙트 게임', description: '한 게임에서 모든 문제를 맞췄어요!', category: AchievementCategory.STREAK, points: 150, rarity: Rarity.RARE, requirement: { type: 'perfect_game', count: 1 } },

    // 학습
    { code: 'CORRECT_100', name: '정답왕', description: '100문제 정답!', category: AchievementCategory.LEARNING, points: 50, rarity: Rarity.COMMON, requirement: { type: 'total_correct', count: 100 } },
    { code: 'CORRECT_500', name: '지식 탐험가', description: '500문제 정답!', category: AchievementCategory.LEARNING, points: 150, rarity: Rarity.RARE, requirement: { type: 'total_correct', count: 500 } },
    { code: 'CORRECT_1000', name: '학습 마스터', description: '1000문제 정답!', category: AchievementCategory.LEARNING, points: 300, rarity: Rarity.EPIC, requirement: { type: 'total_correct', count: 1000 } },

    // 포인트
    { code: 'POINTS_1000', name: '천점 클럽', description: '1,000 포인트 달성!', category: AchievementCategory.COLLECTION, points: 50, rarity: Rarity.COMMON, requirement: { type: 'total_points', count: 1000 } },
    { code: 'POINTS_5000', name: '오천점 마스터', description: '5,000 포인트 달성!', category: AchievementCategory.COLLECTION, points: 100, rarity: Rarity.RARE, requirement: { type: 'total_points', count: 5000 } },
    { code: 'POINTS_10000', name: '만점 레전드', description: '10,000 포인트 달성!', category: AchievementCategory.COLLECTION, points: 200, rarity: Rarity.EPIC, requirement: { type: 'total_points', count: 10000 } },

    // 레벨
    { code: 'LEVEL_5', name: '레벨 5 달성', description: '레벨 5에 도달했어요!', category: AchievementCategory.MASTERY, points: 20, rarity: Rarity.COMMON, requirement: { type: 'level', count: 5 } },
    { code: 'LEVEL_10', name: '레벨 10 달성', description: '레벨 10에 도달했어요!', category: AchievementCategory.MASTERY, points: 50, rarity: Rarity.RARE, requirement: { type: 'level', count: 10 } },
    { code: 'LEVEL_25', name: '레벨 25 달성', description: '레벨 25에 도달했어요!', category: AchievementCategory.MASTERY, points: 150, rarity: Rarity.EPIC, requirement: { type: 'level', count: 25 } },
    { code: 'LEVEL_50', name: '레벨 50 달성', description: '레벨 50에 도달했어요!', category: AchievementCategory.MASTERY, points: 500, rarity: Rarity.LEGENDARY, requirement: { type: 'level', count: 50 } },

    // 특별
    { code: 'WELCOME', name: '환영합니다', description: '에듀플레이 코리아에 가입했어요!', category: AchievementCategory.SPECIAL, points: 10, rarity: Rarity.COMMON, requirement: { type: 'signup', count: 1 } },
    { code: 'FIRST_LOGIN', name: '첫 발걸음', description: '처음 로그인했어요!', category: AchievementCategory.SPECIAL, points: 5, rarity: Rarity.COMMON, requirement: { type: 'login', count: 1 } },
    { code: 'DAILY_7', name: '일주일 연속 출석', description: '7일 연속 출석!', category: AchievementCategory.STREAK, points: 50, rarity: Rarity.COMMON, requirement: { type: 'daily_streak', count: 7 } },
    { code: 'DAILY_30', name: '한 달 연속 출석', description: '30일 연속 출석!', category: AchievementCategory.STREAK, points: 200, rarity: Rarity.RARE, requirement: { type: 'daily_streak', count: 30 } },

    // 과목별
    { code: 'KOREAN_100', name: '국어 달인', description: '국어 문제 100개 정답!', category: AchievementCategory.MASTERY, points: 100, rarity: Rarity.RARE, requirement: { type: 'subject_correct', subject: 'KOR', count: 100 } },
    { code: 'MATH_100', name: '수학 천재', description: '수학 문제 100개 정답!', category: AchievementCategory.MASTERY, points: 100, rarity: Rarity.RARE, requirement: { type: 'subject_correct', subject: 'MATH', count: 100 } },
    { code: 'ENG_100', name: '영어 마스터', description: '영어 문제 100개 정답!', category: AchievementCategory.MASTERY, points: 100, rarity: Rarity.RARE, requirement: { type: 'subject_correct', subject: 'ENG', count: 100 } },
    { code: 'SCI_100', name: '과학 박사', description: '과학 문제 100개 정답!', category: AchievementCategory.MASTERY, points: 100, rarity: Rarity.RARE, requirement: { type: 'subject_correct', subject: 'SCI', count: 100 } },
    { code: 'SOC_100', name: '사회 탐험가', description: '사회 문제 100개 정답!', category: AchievementCategory.MASTERY, points: 100, rarity: Rarity.RARE, requirement: { type: 'subject_correct', subject: 'SOC', count: 100 } },
  ]

  await prisma.achievement.createMany({ data: achievements })
}

// 영역 코드 매핑
const areaCodeMap: Record<string, Record<string, string>> = {
  KOR: {
    '듣기·말하기': 'KOR-01',
    '읽기': 'KOR-02',
    '쓰기': 'KOR-03',
    '문법': 'KOR-04',
    '문학': 'KOR-05',
  },
  MATH: {
    '수와 연산': 'MATH-01',
    '도형': 'MATH-02',
    '측정': 'MATH-03',
    '규칙성': 'MATH-04',
    '자료와 가능성': 'MATH-05',
  },
  ENG: {
    '듣기': 'ENG-01',
    '말하기': 'ENG-02',
    '읽기': 'ENG-03',
    '쓰기': 'ENG-04',
  },
  SOC: {
    '지리 인식': 'SOC-01',
    '장소와 지역': 'SOC-02',
    '경제': 'SOC-03',
    '정치': 'SOC-04',
    '역사 일반': 'SOC-05',
  },
  SCI: {
    '물질': 'SCI-01',
    '생명': 'SCI-02',
    '운동과 에너지': 'SCI-03',
    '지구와 우주': 'SCI-04',
  },
}

async function createElementarySubjectsWithStandards() {
  // ==================== 국어 ====================
  const korean = await prisma.subject.create({
    data: {
      code: 'KOR_E',
      name: '국어',
      description: '초등학교 국어 (1-6학년)',
      color: '#3B82F6',
      schoolLevel: SchoolLevel.ELEMENTARY,
    },
  })
  await createSubjectAreasAndStandards(korean.id, koreanStandards)

  // ==================== 수학 ====================
  const math = await prisma.subject.create({
    data: {
      code: 'MATH_E',
      name: '수학',
      description: '초등학교 수학 (1-6학년)',
      color: '#10B981',
      schoolLevel: SchoolLevel.ELEMENTARY,
    },
  })
  await createSubjectAreasAndStandards(math.id, mathStandards)

  // ==================== 영어 ====================
  const english = await prisma.subject.create({
    data: {
      code: 'ENG_E',
      name: '영어',
      description: '초등학교 영어 (3-6학년)',
      color: '#8B5CF6',
      schoolLevel: SchoolLevel.ELEMENTARY,
    },
  })
  await createSubjectAreasAndStandards(english.id, englishStandards)

  // ==================== 사회 ====================
  const social = await prisma.subject.create({
    data: {
      code: 'SOC_E',
      name: '사회',
      description: '초등학교 사회 (3-6학년)',
      color: '#F59E0B',
      schoolLevel: SchoolLevel.ELEMENTARY,
    },
  })
  await createSubjectAreasAndStandards(social.id, socialStandards)

  // ==================== 과학 ====================
  const science = await prisma.subject.create({
    data: {
      code: 'SCI_E',
      name: '과학',
      description: '초등학교 과학 (3-6학년)',
      color: '#EF4444',
      schoolLevel: SchoolLevel.ELEMENTARY,
    },
  })
  await createSubjectAreasAndStandards(science.id, scienceStandards)
}

async function createSubjectAreasAndStandards(subjectId: string, data: SubjectStandardsData) {
  // 영역별로 그룹화
  const areaGroups = new Map<string, typeof data.standards>()

  for (const standard of data.standards) {
    const areaName = standard.areaName
    if (!areaGroups.has(areaName)) {
      areaGroups.set(areaName, [])
    }
    areaGroups.get(areaName)!.push(standard)
  }

  // 영역 생성 및 성취기준 추가
  let order = 1
  for (const [areaName, standards] of areaGroups) {
    const areaCodePrefix = data.subjectCode.substring(0, 3).toUpperCase()
    const areaCode = areaCodeMap[areaCodePrefix]?.[areaName] || `${areaCodePrefix}-${order.toString().padStart(2, '0')}`

    const area = await prisma.curriculumArea.create({
      data: {
        code: areaCode,
        name: areaName,
        order,
        subjectId,
      },
    })

    // 해당 영역의 성취기준 생성
    for (const standard of standards) {
      await prisma.achievementStandard.create({
        data: {
          code: standard.code,
          gradeGroup: standard.gradeGroup,
          grade: standard.grade,
          semester: standard.semester,
          description: standard.description,
          explanation: standard.explanation || null,
          keyCompetencies: standard.keyCompetencies,
          curriculumAreaId: area.id,
        },
      })
    }

    order++
  }

  console.log(`  - ${data.subjectName}: ${data.standards.length}개 성취기준 생성`)
}

async function createMiddleSchoolSubjects() {
  // 중학교 국어
  await prisma.subject.create({
    data: {
      code: 'KOR_M',
      name: '국어',
      description: '중학교 국어',
      color: '#3B82F6',
      schoolLevel: SchoolLevel.MIDDLE,
    },
  })

  // 중학교 수학
  await prisma.subject.create({
    data: {
      code: 'MATH_M',
      name: '수학',
      description: '중학교 수학',
      color: '#10B981',
      schoolLevel: SchoolLevel.MIDDLE,
    },
  })

  // 중학교 영어
  await prisma.subject.create({
    data: {
      code: 'ENG_M',
      name: '영어',
      description: '중학교 영어',
      color: '#8B5CF6',
      schoolLevel: SchoolLevel.MIDDLE,
    },
  })

  // 중학교 사회
  await prisma.subject.create({
    data: {
      code: 'SOC_M',
      name: '사회',
      description: '중학교 사회',
      color: '#F59E0B',
      schoolLevel: SchoolLevel.MIDDLE,
    },
  })

  // 중학교 역사
  await prisma.subject.create({
    data: {
      code: 'HIS_M',
      name: '역사',
      description: '중학교 역사',
      color: '#EC4899',
      schoolLevel: SchoolLevel.MIDDLE,
    },
  })

  // 중학교 과학
  await prisma.subject.create({
    data: {
      code: 'SCI_M',
      name: '과학',
      description: '중학교 과학',
      color: '#EF4444',
      schoolLevel: SchoolLevel.MIDDLE,
    },
  })
}

async function createSampleQuestions() {
  // 성취기준 찾기
  const mathStandard = await prisma.achievementStandard.findFirst({
    where: { code: '[2수01-01]' },
  })

  const koreanStandard = await prisma.achievementStandard.findFirst({
    where: { code: '[2국01-01]' },
  })

  if (mathStandard) {
    await prisma.question.createMany({
      data: [
        {
          achievementStandardId: mathStandard.id,
          type: 'MULTIPLE_CHOICE',
          bloomLevel: 'REMEMBER',
          content: '다음 중 50보다 큰 수는 어느 것인가요?',
          options: ['35', '48', '52', '49'],
          answer: '52',
          answerExplanation: '50보다 큰 수는 51, 52, 53... 등입니다. 보기 중 52만이 50보다 큽니다.',
          wrongAnswerExplanation: { '35': '35는 50보다 15 작습니다.', '48': '48은 50보다 2 작습니다.', '49': '49는 50보다 1 작습니다.' },
          difficulty: 2,
          points: 100,
          timeLimit: 30,
          tags: ['수', '비교', '1-2학년'],
        },
        {
          achievementStandardId: mathStandard.id,
          type: 'MULTIPLE_CHOICE',
          bloomLevel: 'UNDERSTAND',
          content: '10이 3개, 1이 5개이면 어떤 수인가요?',
          options: ['35', '53', '15', '31'],
          answer: '35',
          answerExplanation: '10이 3개이면 30이고, 1이 5개이면 5입니다. 30 + 5 = 35입니다.',
          difficulty: 2,
          points: 100,
          timeLimit: 30,
          tags: ['자릿값', '두 자리 수', '1-2학년'],
        },
        {
          achievementStandardId: mathStandard.id,
          type: 'TRUE_FALSE',
          bloomLevel: 'REMEMBER',
          content: '29 다음 수는 30이다.',
          options: ['O', 'X'],
          answer: 'O',
          answerExplanation: '29 다음 수는 30입니다. 29 + 1 = 30',
          difficulty: 1,
          points: 100,
          timeLimit: 20,
          tags: ['수 세기', '1-2학년'],
        },
      ],
    })
  }

  if (koreanStandard) {
    await prisma.question.createMany({
      data: [
        {
          achievementStandardId: koreanStandard.id,
          type: 'MULTIPLE_CHOICE',
          bloomLevel: 'APPLY',
          content: '아침에 선생님을 만났을 때 하는 인사말로 알맞은 것은?',
          options: ['안녕히 주무세요', '안녕히 가세요', '안녕하세요', '다녀오겠습니다'],
          answer: '안녕하세요',
          answerExplanation: '아침에 선생님을 만났을 때는 "안녕하세요"라고 인사합니다.',
          wrongAnswerExplanation: { '안녕히 주무세요': '이 표현은 밤에 잠자리에 들 때 하는 인사입니다.', '안녕히 가세요': '이 표현은 헤어질 때 하는 인사입니다.', '다녀오겠습니다': '이 표현은 외출할 때 하는 인사입니다.' },
          difficulty: 1,
          points: 100,
          timeLimit: 30,
          tags: ['인사말', '예절', '1-2학년'],
        },
        {
          achievementStandardId: koreanStandard.id,
          type: 'MULTIPLE_CHOICE',
          bloomLevel: 'APPLY',
          content: '친구에게 도움을 받았을 때 하는 말로 알맞은 것은?',
          options: ['미안해', '고마워', '안녕', '잘 가'],
          answer: '고마워',
          answerExplanation: '친구에게 도움을 받았을 때는 "고마워"라고 감사의 말을 합니다.',
          difficulty: 1,
          points: 100,
          timeLimit: 30,
          tags: ['감사', '인사말', '1-2학년'],
        },
      ],
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
