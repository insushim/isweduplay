import { PrismaClient, SchoolLevel, AchievementCategory, Rarity } from '@prisma/client'

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
  let totalExp = 0
  for (let i = 1; i <= 100; i++) {
    const requiredExp = Math.floor(100 * Math.pow(1.5, i - 1))
    totalExp += requiredExp
    levels.push({
      level: i,
      requiredExp: totalExp,
      title: getLevelTitle(i),
      bonusMultiplier: 1 + (i - 1) * 0.02,
    })
  }
  await prisma.levelConfig.createMany({ data: levels })

  // ==================== 업적 시스템 ====================
  console.log('Creating achievements...')
  await createAchievements()

  // ==================== 초등학교 교과목 ====================
  console.log('Creating elementary subjects...')
  await createElementarySubjects()

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

async function createElementarySubjects() {
  // ==================== 국어 ====================
  const korean = await prisma.subject.create({
    data: {
      code: 'KOR_E',
      name: '국어',
      description: '초등학교 국어',
      color: '#3B82F6',
      schoolLevel: SchoolLevel.ELEMENTARY,
    },
  })

  // 국어 영역
  const korAreas = [
    { code: 'KOR-01', name: '듣기·말하기', order: 1 },
    { code: 'KOR-02', name: '읽기', order: 2 },
    { code: 'KOR-03', name: '쓰기', order: 3 },
    { code: 'KOR-04', name: '문법', order: 4 },
    { code: 'KOR-05', name: '문학', order: 5 },
  ]

  for (const area of korAreas) {
    const createdArea = await prisma.curriculumArea.create({
      data: { ...area, subjectId: korean.id },
    })

    // 1-2학년 성취기준
    if (area.code === 'KOR-01') {
      await createKoreanListeningSpeakingStandards(createdArea.id)
    } else if (area.code === 'KOR-02') {
      await createKoreanReadingStandards(createdArea.id)
    } else if (area.code === 'KOR-03') {
      await createKoreanWritingStandards(createdArea.id)
    } else if (area.code === 'KOR-04') {
      await createKoreanGrammarStandards(createdArea.id)
    } else if (area.code === 'KOR-05') {
      await createKoreanLiteratureStandards(createdArea.id)
    }
  }

  // ==================== 수학 ====================
  const math = await prisma.subject.create({
    data: {
      code: 'MATH_E',
      name: '수학',
      description: '초등학교 수학',
      color: '#10B981',
      schoolLevel: SchoolLevel.ELEMENTARY,
    },
  })

  const mathAreas = [
    { code: 'MATH-01', name: '수와 연산', order: 1 },
    { code: 'MATH-02', name: '변화와 관계', order: 2 },
    { code: 'MATH-03', name: '도형과 측정', order: 3 },
    { code: 'MATH-04', name: '자료와 가능성', order: 4 },
  ]

  for (const area of mathAreas) {
    const createdArea = await prisma.curriculumArea.create({
      data: { ...area, subjectId: math.id },
    })

    if (area.code === 'MATH-01') {
      await createMathNumberStandards(createdArea.id)
    } else if (area.code === 'MATH-03') {
      await createMathGeometryStandards(createdArea.id)
    }
  }

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

  const engAreas = [
    { code: 'ENG-01', name: '듣기', order: 1 },
    { code: 'ENG-02', name: '말하기', order: 2 },
    { code: 'ENG-03', name: '읽기', order: 3 },
    { code: 'ENG-04', name: '쓰기', order: 4 },
  ]

  for (const area of engAreas) {
    const createdArea = await prisma.curriculumArea.create({
      data: { ...area, subjectId: english.id },
    })

    if (area.code === 'ENG-01') {
      await createEnglishListeningStandards(createdArea.id)
    }
  }

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

  const socAreas = [
    { code: 'SOC-01', name: '지리 인식', order: 1 },
    { code: 'SOC-02', name: '자연환경과 인간 생활', order: 2 },
    { code: 'SOC-03', name: '인문환경과 인간 생활', order: 3 },
    { code: 'SOC-04', name: '지속 가능한 세계', order: 4 },
    { code: 'SOC-05', name: '정치', order: 5 },
    { code: 'SOC-06', name: '경제', order: 6 },
    { code: 'SOC-07', name: '사회·문화', order: 7 },
    { code: 'SOC-08', name: '역사 일반', order: 8 },
  ]

  for (const area of socAreas) {
    await prisma.curriculumArea.create({
      data: { ...area, subjectId: social.id },
    })
  }

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

  const sciAreas = [
    { code: 'SCI-01', name: '운동과 에너지', order: 1 },
    { code: 'SCI-02', name: '물질', order: 2 },
    { code: 'SCI-03', name: '생명', order: 3 },
    { code: 'SCI-04', name: '지구와 우주', order: 4 },
  ]

  for (const area of sciAreas) {
    const createdArea = await prisma.curriculumArea.create({
      data: { ...area, subjectId: science.id },
    })

    if (area.code === 'SCI-03') {
      await createScienceLifeStandards(createdArea.id)
    }
  }
}

async function createMiddleSchoolSubjects() {
  // 중학교 국어
  const korean = await prisma.subject.create({
    data: {
      code: 'KOR_M',
      name: '국어',
      description: '중학교 국어',
      color: '#3B82F6',
      schoolLevel: SchoolLevel.MIDDLE,
    },
  })

  // 중학교 수학
  const math = await prisma.subject.create({
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

// ==================== 국어 성취기준 ====================
async function createKoreanListeningSpeakingStandards(areaId: string) {
  const standards = [
    {
      code: '[2국01-01]',
      gradeGroup: '1-2',
      description: '상황에 어울리는 인사말을 주고받는다.',
      explanation: '일상생활에서 때와 장소, 상대에 따라 적절한 인사말을 주고받을 수 있는 능력을 기른다.',
      keyCompetencies: ['의사소통 역량', '공동체 역량'],
      teachingNotes: '실제 상황에서 역할극을 통해 연습하도록 한다.',
    },
    {
      code: '[2국01-02]',
      gradeGroup: '1-2',
      description: '일이 일어난 순서를 고려하며 듣고 말한다.',
      explanation: '사건이나 경험을 시간 순서에 따라 정리하여 듣고 말할 수 있는 능력을 기른다.',
      keyCompetencies: ['의사소통 역량', '비판적 창의적 사고 역량'],
    },
    {
      code: '[2국01-03]',
      gradeGroup: '1-2',
      description: '자신의 감정을 표현하며 대화를 나눈다.',
      explanation: '자신의 기분이나 감정을 적절한 말과 표정으로 표현하며 상대와 대화할 수 있는 능력을 기른다.',
      keyCompetencies: ['의사소통 역량', '자기 관리 역량'],
    },
    {
      code: '[4국01-01]',
      gradeGroup: '3-4',
      description: '대화의 즐거움을 알고 대화를 나눈다.',
      explanation: '대화를 통해 상대방과 생각이나 감정을 나누는 즐거움을 경험하고 적극적으로 대화에 참여하는 태도를 기른다.',
      keyCompetencies: ['의사소통 역량', '공동체 역량'],
    },
    {
      code: '[4국01-02]',
      gradeGroup: '3-4',
      description: '회의에서 의견을 적극적으로 교환한다.',
      explanation: '회의의 절차와 방법을 알고 자신의 의견을 적극적으로 말하며, 다른 사람의 의견을 존중하는 태도를 기른다.',
      keyCompetencies: ['의사소통 역량', '공동체 역량', '비판적 창의적 사고 역량'],
    },
    {
      code: '[6국01-01]',
      gradeGroup: '5-6',
      description: '구어 의사소통의 특성을 바탕으로 하여 듣기·말하기 활동을 한다.',
      explanation: '음성 언어의 특성과 구어 의사소통의 특성을 이해하고 이를 바탕으로 효과적인 듣기·말하기 활동을 한다.',
      keyCompetencies: ['의사소통 역량', '비판적 창의적 사고 역량'],
    },
  ]

  for (const standard of standards) {
    const created = await prisma.achievementStandard.create({
      data: {
        ...standard,
        curriculumAreaId: areaId,
      },
    })

    // 학습 요소 추가
    await createLearningElementsForStandard(created.id, standard.code)
  }
}

async function createKoreanReadingStandards(areaId: string) {
  const standards = [
    {
      code: '[2국02-01]',
      gradeGroup: '1-2',
      description: '글자, 낱말, 문장을 소리 내어 읽는다.',
      explanation: '한글의 자모 체계를 이해하고 글자를 바르게 읽을 수 있는 기초 문해력을 기른다.',
      keyCompetencies: ['의사소통 역량'],
      teachingNotes: '받아쓰기와 연계하여 지도한다.',
    },
    {
      code: '[2국02-02]',
      gradeGroup: '1-2',
      description: '문장과 글을 알맞게 띄어 읽는다.',
      explanation: '문장의 끊어 읽기를 통해 의미를 파악하며 읽는 능력을 기른다.',
      keyCompetencies: ['의사소통 역량'],
    },
    {
      code: '[4국02-01]',
      gradeGroup: '3-4',
      description: '문단과 글의 중심 생각을 파악한다.',
      explanation: '글의 구조를 이해하고 핵심 내용을 파악하는 읽기 능력을 기른다.',
      keyCompetencies: ['의사소통 역량', '비판적 창의적 사고 역량'],
    },
    {
      code: '[6국02-01]',
      gradeGroup: '5-6',
      description: '읽기는 글에 나타난 정보와 독자의 배경지식을 활용하여 문제를 해결하는 과정임을 이해하고 글을 읽는다.',
      explanation: '읽기 과정에서 배경지식의 활성화가 중요함을 알고 적극적으로 활용한다.',
      keyCompetencies: ['의사소통 역량', '비판적 창의적 사고 역량'],
    },
  ]

  for (const standard of standards) {
    await prisma.achievementStandard.create({
      data: {
        ...standard,
        curriculumAreaId: areaId,
      },
    })
  }
}

async function createKoreanWritingStandards(areaId: string) {
  const standards = [
    {
      code: '[2국03-01]',
      gradeGroup: '1-2',
      description: '글자를 바르게 쓴다.',
      explanation: '한글의 자모를 바른 순서와 모양으로 쓸 수 있는 기초 문해력을 기른다.',
      keyCompetencies: ['의사소통 역량'],
    },
    {
      code: '[2국03-02]',
      gradeGroup: '1-2',
      description: '자신의 생각을 문장으로 표현한다.',
      explanation: '간단한 생각이나 느낌을 완결된 문장으로 표현할 수 있는 능력을 기른다.',
      keyCompetencies: ['의사소통 역량', '비판적 창의적 사고 역량'],
    },
    {
      code: '[4국03-01]',
      gradeGroup: '3-4',
      description: '중심 문장과 뒷받침 문장을 갖추어 문단을 쓴다.',
      explanation: '문단의 구조를 이해하고 논리적으로 글을 구성하는 능력을 기른다.',
      keyCompetencies: ['의사소통 역량', '비판적 창의적 사고 역량'],
    },
  ]

  for (const standard of standards) {
    await prisma.achievementStandard.create({
      data: {
        ...standard,
        curriculumAreaId: areaId,
      },
    })
  }
}

async function createKoreanGrammarStandards(areaId: string) {
  const standards = [
    {
      code: '[2국04-01]',
      gradeGroup: '1-2',
      description: '한글 자모의 이름과 소릿값을 알고 정확하게 발음하고 쓴다.',
      explanation: '한글의 자음과 모음의 이름과 소리를 정확히 알고 활용할 수 있다.',
      keyCompetencies: ['의사소통 역량'],
    },
    {
      code: '[4국04-01]',
      gradeGroup: '3-4',
      description: '낱말을 분류하고 국어사전에서 낱말을 찾는다.',
      explanation: '품사의 기초 개념을 이해하고 국어사전 활용 능력을 기른다.',
      keyCompetencies: ['의사소통 역량', '지식정보처리 역량'],
    },
    {
      code: '[6국04-01]',
      gradeGroup: '5-6',
      description: '언어는 생각을 표현하며 다른 사람과 관계를 맺는 수단임을 이해하고 국어 생활을 한다.',
      explanation: '언어의 본질적 기능을 이해하고 효과적인 언어생활을 한다.',
      keyCompetencies: ['의사소통 역량', '공동체 역량'],
    },
  ]

  for (const standard of standards) {
    await prisma.achievementStandard.create({
      data: {
        ...standard,
        curriculumAreaId: areaId,
      },
    })
  }
}

async function createKoreanLiteratureStandards(areaId: string) {
  const standards = [
    {
      code: '[2국05-01]',
      gradeGroup: '1-2',
      description: '동시를 낭송하거나 노래, 짧은 이야기를 듣고 재미를 느낀다.',
      explanation: '문학 작품을 즐기며 감상하는 기초 태도를 기른다.',
      keyCompetencies: ['심미적 감성 역량', '의사소통 역량'],
    },
    {
      code: '[4국05-01]',
      gradeGroup: '3-4',
      description: '시각이나 청각 등 감각적 표현에 주목하며 작품을 감상한다.',
      explanation: '문학 작품에서 감각적 표현의 효과를 이해하고 감상하는 능력을 기른다.',
      keyCompetencies: ['심미적 감성 역량', '비판적 창의적 사고 역량'],
    },
    {
      code: '[6국05-01]',
      gradeGroup: '5-6',
      description: '문학은 가치 있는 내용을 언어로 형상화하여 아름다움을 느끼게 하는 활동임을 이해하고 문학 활동을 한다.',
      explanation: '문학의 본질을 이해하고 적극적으로 문학 활동에 참여한다.',
      keyCompetencies: ['심미적 감성 역량', '비판적 창의적 사고 역량'],
    },
  ]

  for (const standard of standards) {
    await prisma.achievementStandard.create({
      data: {
        ...standard,
        curriculumAreaId: areaId,
      },
    })
  }
}

// ==================== 수학 성취기준 ====================
async function createMathNumberStandards(areaId: string) {
  const standards = [
    {
      code: '[2수01-01]',
      gradeGroup: '1-2',
      description: '0과 100까지의 수 개념을 이해하고, 수를 세고 읽고 쓸 수 있다.',
      explanation: '수의 기초 개념을 형성하고 일상생활에서 수를 활용할 수 있다.',
      keyCompetencies: ['문제해결 역량', '추론 역량'],
      teachingNotes: '구체물을 활용한 조작 활동을 통해 수 개념을 형성하도록 한다.',
    },
    {
      code: '[2수01-02]',
      gradeGroup: '1-2',
      description: '일, 십의 자릿값을 알고, 두 자리 수의 범위에서 수의 크기를 비교할 수 있다.',
      explanation: '자릿값의 개념을 이해하고 수의 크기를 비교할 수 있다.',
      keyCompetencies: ['문제해결 역량', '추론 역량'],
    },
    {
      code: '[2수01-03]',
      gradeGroup: '1-2',
      description: '덧셈과 뺄셈이 이루어지는 실생활 상황을 통해 덧셈과 뺄셈의 의미를 이해한다.',
      explanation: '덧셈과 뺄셈의 의미를 실생활 맥락에서 이해한다.',
      keyCompetencies: ['문제해결 역량', '의사소통 역량'],
    },
    {
      code: '[4수01-01]',
      gradeGroup: '3-4',
      description: '큰 수의 범위에서 수의 체계를 이해하고 수를 읽고 쓸 수 있다.',
      explanation: '만, 억, 조의 개념을 이해하고 큰 수를 다룰 수 있다.',
      keyCompetencies: ['문제해결 역량', '추론 역량'],
    },
    {
      code: '[4수01-02]',
      gradeGroup: '3-4',
      description: '곱셈과 나눗셈의 관계를 이해한다.',
      explanation: '곱셈과 나눗셈이 역연산 관계임을 이해한다.',
      keyCompetencies: ['문제해결 역량', '추론 역량'],
    },
    {
      code: '[4수01-03]',
      gradeGroup: '3-4',
      description: '분수를 이해하고 그 크기를 비교할 수 있다.',
      explanation: '분수의 개념을 이해하고 크기 비교를 할 수 있다.',
      keyCompetencies: ['문제해결 역량', '추론 역량'],
    },
    {
      code: '[6수01-01]',
      gradeGroup: '5-6',
      description: '분수의 나눗셈의 의미를 이해하고 그 계산을 할 수 있다.',
      explanation: '분수의 나눗셈을 다양한 상황에서 이해하고 계산할 수 있다.',
      keyCompetencies: ['문제해결 역량', '추론 역량'],
    },
  ]

  for (const standard of standards) {
    const created = await prisma.achievementStandard.create({
      data: {
        ...standard,
        curriculumAreaId: areaId,
      },
    })

    await createLearningElementsForStandard(created.id, standard.code)
  }
}

async function createMathGeometryStandards(areaId: string) {
  const standards = [
    {
      code: '[2수03-01]',
      gradeGroup: '1-2',
      description: '교실 및 생활 주변에서 여러 가지 물건을 관찰하여 삼각형, 사각형, 원의 모양을 찾을 수 있다.',
      explanation: '기본 도형을 일상에서 발견하고 분류할 수 있다.',
      keyCompetencies: ['문제해결 역량', '의사소통 역량'],
    },
    {
      code: '[4수03-01]',
      gradeGroup: '3-4',
      description: '각의 개념을 알고 직각, 예각, 둔각을 구별할 수 있다.',
      explanation: '각의 종류를 이해하고 구별할 수 있다.',
      keyCompetencies: ['문제해결 역량', '추론 역량'],
    },
    {
      code: '[6수03-01]',
      gradeGroup: '5-6',
      description: '직육면체와 정육면체를 이해하고, 구성 요소와 성질을 탐구할 수 있다.',
      explanation: '입체도형의 특성을 탐구하고 이해할 수 있다.',
      keyCompetencies: ['문제해결 역량', '추론 역량'],
    },
  ]

  for (const standard of standards) {
    await prisma.achievementStandard.create({
      data: {
        ...standard,
        curriculumAreaId: areaId,
      },
    })
  }
}

// ==================== 영어 성취기준 ====================
async function createEnglishListeningStandards(areaId: string) {
  const standards = [
    {
      code: '[4영01-01]',
      gradeGroup: '3-4',
      description: '알파벳 대소문자를 식별하여 읽을 수 있다.',
      explanation: '알파벳의 대문자와 소문자를 구별하고 읽을 수 있다.',
      keyCompetencies: ['의사소통 역량'],
    },
    {
      code: '[4영01-02]',
      gradeGroup: '3-4',
      description: '영어의 소리와 강세, 리듬, 억양에 관심을 가진다.',
      explanation: '영어 발음의 특성에 대한 인식을 기른다.',
      keyCompetencies: ['의사소통 역량'],
    },
    {
      code: '[6영01-01]',
      gradeGroup: '5-6',
      description: '일상생활 속 친숙한 주제에 관한 간단한 말을 듣고 세부 정보를 파악한다.',
      explanation: '친숙한 주제의 대화를 듣고 주요 정보를 이해한다.',
      keyCompetencies: ['의사소통 역량', '지식정보처리 역량'],
    },
  ]

  for (const standard of standards) {
    await prisma.achievementStandard.create({
      data: {
        ...standard,
        curriculumAreaId: areaId,
      },
    })
  }
}

// ==================== 과학 성취기준 ====================
async function createScienceLifeStandards(areaId: string) {
  const standards = [
    {
      code: '[4과03-01]',
      gradeGroup: '3-4',
      description: '여러 가지 식물을 관찰하여 특징에 따라 식물을 분류할 수 있다.',
      explanation: '식물의 특성을 관찰하고 분류 기준을 세워 분류할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '과학적 사고력'],
    },
    {
      code: '[4과03-02]',
      gradeGroup: '3-4',
      description: '동물을 관찰하여 특징에 따라 동물을 분류할 수 있다.',
      explanation: '동물의 특성을 관찰하고 분류할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '과학적 사고력'],
    },
    {
      code: '[6과03-01]',
      gradeGroup: '5-6',
      description: '우리 몸의 구조와 기능을 설명할 수 있다.',
      explanation: '인체의 기관과 기능을 이해하고 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '과학적 의사소통 능력'],
    },
  ]

  for (const standard of standards) {
    await prisma.achievementStandard.create({
      data: {
        ...standard,
        curriculumAreaId: areaId,
      },
    })
  }
}

// ==================== 학습 요소 생성 ====================
async function createLearningElementsForStandard(standardId: string, code: string) {
  const learningElements: Record<string, Array<{
    name: string
    keywords: string[]
    vocabulary: string[]
    misconceptions?: object
    difficulty: number
    order: number
  }>> = {
    '[2국01-01]': [
      { name: '인사말 종류 알기', keywords: ['인사말', '안녕', '감사'], vocabulary: ['안녕하세요', '감사합니다', '죄송합니다'], difficulty: 1, order: 1 },
      { name: '상황에 맞는 인사말', keywords: ['아침', '저녁', '만남', '헤어짐'], vocabulary: ['좋은 아침', '안녕히 가세요', '다음에 봬요'], difficulty: 2, order: 2 },
    ],
    '[2수01-01]': [
      { name: '0-10까지 수 세기', keywords: ['수', '세기', '순서'], vocabulary: ['하나', '둘', '셋'], difficulty: 1, order: 1 },
      { name: '10-100까지 수 세기', keywords: ['십', '이십', '삼십'], vocabulary: ['열', '스물', '서른'], misconceptions: { common: '19 다음은 110이 아니라 20이다' }, difficulty: 2, order: 2 },
      { name: '수의 크기 비교', keywords: ['크다', '작다', '같다'], vocabulary: ['>', '<', '='], difficulty: 2, order: 3 },
    ],
    '[4수01-03]': [
      { name: '분수의 개념', keywords: ['분수', '분자', '분모'], vocabulary: ['반', '4분의 1', '전체'], misconceptions: { common: '분모가 클수록 분수가 큰 것이 아니다' }, difficulty: 2, order: 1 },
      { name: '단위분수', keywords: ['단위분수', '1/2', '1/3'], vocabulary: ['절반', '3분의 1'], difficulty: 2, order: 2 },
      { name: '분수의 크기 비교', keywords: ['크기', '비교', '통분'], vocabulary: ['같은 분모', '다른 분모'], difficulty: 3, order: 3 },
    ],
  }

  const elements = learningElements[code]
  if (elements) {
    for (const element of elements) {
      await prisma.learningElement.create({
        data: {
          ...element,
          achievementStandardId: standardId,
        },
      })
    }
  }
}

// ==================== 샘플 문제 생성 ====================
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
