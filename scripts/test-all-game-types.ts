import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GAME_TYPES = [
  'QUIZ_BATTLE',
  'SPEED_RACE',
  'SURVIVAL',
  'TEAM_BATTLE',
  'TOWER_DEFENSE',
  'MEMORY_MATCH',
  'WORD_HUNT',
  'BINGO',
  'ESCAPE_ROOM',
  'PUZZLE_QUEST',
  'MATH_RUNNER',
  'WORD_CHAIN',
  'JEOPARDY',
  'WHEEL_FORTUNE',
  'FLASH_CARDS',
  'MATCHING_PAIRS',
  'FILL_THE_BLANKS',
  'TIME_ATTACK',
] as const;

async function testAllGameTypes() {
  console.log('=== 18개 게임 형식 테스트 시작 ===\n');

  try {
    // 1. 퀴즈셋 확인
    const quizSet = await prisma.quizSet.findFirst({
      where: { title: '게임 테스트용 종합 퀴즈셋' },
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    });

    if (!quizSet) {
      console.error('테스트용 퀴즈셋이 없습니다. 먼저 create-test-data.ts를 실행하세요.');
      return;
    }

    console.log(`퀴즈셋: ${quizSet.title}`);
    console.log(`총 문제 수: ${quizSet.questions.length}\n`);

    // 문제 유형별 통계
    const questionTypes: Record<string, number> = {};
    quizSet.questions.forEach(q => {
      const type = q.question.type;
      questionTypes[type] = (questionTypes[type] || 0) + 1;
    });

    console.log('문제 유형별 분포:');
    Object.entries(questionTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}개`);
    });
    console.log('\n');

    // 2. 호스트 찾기
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' }
    });

    if (!teacher) {
      console.error('교사 계정이 없습니다.');
      return;
    }

    console.log(`호스트: ${teacher.name} (${teacher.id})\n`);

    // 3. 각 게임 타입별 테스트
    const results: Array<{
      gameType: string;
      status: 'SUCCESS' | 'FAILED';
      roomCode?: string;
      sessionId?: string;
      error?: string;
      questions?: number;
    }> = [];

    for (const gameType of GAME_TYPES) {
      console.log(`\n[${gameType}] 테스트 중...`);

      try {
        // 방 코드 생성
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let roomCode = '';
        for (let i = 0; i < 6; i++) {
          roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // 게임 세션 생성
        const session = await prisma.gameSession.create({
          data: {
            hostId: teacher.id,
            roomCode,
            gameType,
            gameMode: 'CLASSIC',
            status: 'WAITING',
            maxPlayers: 50,
            currentRound: 0,
            totalRounds: quizSet.questions.length,
            quizSetId: quizSet.id,
            settings: {
              timeLimit: 30,
              pointMultiplier: 1,
              shuffleQuestions: true,
              shuffleAnswers: true,
              showLeaderboard: true,
              allowReconnect: true,
            },
          },
        });

        // 세션 조회하여 퀴즈셋 데이터 확인
        const fullSession = await prisma.gameSession.findUnique({
          where: { id: session.id },
          include: {
            quizSet: {
              include: {
                questions: {
                  include: {
                    question: true
                  },
                  orderBy: {
                    order: 'asc'
                  }
                }
              }
            }
          }
        });

        const questionCount = fullSession?.quizSet?.questions.length || 0;

        console.log(`  ✓ 성공: 방 코드 ${roomCode}, 문제 ${questionCount}개 로드됨`);

        results.push({
          gameType,
          status: 'SUCCESS',
          roomCode,
          sessionId: session.id,
          questions: questionCount,
        });

        // 테스트 후 세션 삭제 (깔끔하게 유지)
        await prisma.gameSession.delete({
          where: { id: session.id }
        });

      } catch (error: any) {
        console.log(`  ✗ 실패: ${error.message}`);
        results.push({
          gameType,
          status: 'FAILED',
          error: error.message,
        });
      }
    }

    // 4. 결과 요약
    console.log('\n\n=== 테스트 결과 요약 ===\n');

    const successCount = results.filter(r => r.status === 'SUCCESS').length;
    const failedCount = results.filter(r => r.status === 'FAILED').length;

    console.log(`성공: ${successCount}개 / 실패: ${failedCount}개\n`);

    if (failedCount > 0) {
      console.log('실패한 게임 형식:');
      results.filter(r => r.status === 'FAILED').forEach(r => {
        console.log(`  - ${r.gameType}: ${r.error}`);
      });
    }

    console.log('\n성공한 게임 형식:');
    results.filter(r => r.status === 'SUCCESS').forEach(r => {
      console.log(`  ✓ ${r.gameType}: 문제 ${r.questions}개 로드됨`);
    });

    // 5. 게임 형식별 권장 문제 유형 검증
    console.log('\n\n=== 게임 형식별 문제 유형 호환성 ===\n');

    const gameQuestionRecommendations = {
      'QUIZ_BATTLE': ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'],
      'SPEED_RACE': ['MULTIPLE_CHOICE', 'TRUE_FALSE'],
      'SURVIVAL': ['MULTIPLE_CHOICE', 'TRUE_FALSE'],
      'TEAM_BATTLE': ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'],
      'TOWER_DEFENSE': ['MULTIPLE_CHOICE', 'TRUE_FALSE'],
      'MEMORY_MATCH': ['MATCHING'],
      'WORD_HUNT': ['SHORT_ANSWER', 'FILL_IN_BLANK'],
      'BINGO': ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'],
      'ESCAPE_ROOM': ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ORDERING'],
      'PUZZLE_QUEST': ['ORDERING', 'MATCHING'],
      'MATH_RUNNER': ['SHORT_ANSWER', 'FILL_IN_BLANK'],
      'WORD_CHAIN': ['SHORT_ANSWER'],
      'JEOPARDY': ['MULTIPLE_CHOICE', 'SHORT_ANSWER'],
      'WHEEL_FORTUNE': ['FILL_IN_BLANK', 'SHORT_ANSWER'],
      'FLASH_CARDS': ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'],
      'MATCHING_PAIRS': ['MATCHING'],
      'FILL_THE_BLANKS': ['FILL_IN_BLANK'],
      'TIME_ATTACK': ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'],
    };

    const availableTypes = Object.keys(questionTypes);

    for (const gameType of GAME_TYPES) {
      const recommended = gameQuestionRecommendations[gameType];
      const available = recommended.filter(t => availableTypes.includes(t));
      const missing = recommended.filter(t => !availableTypes.includes(t));

      const status = available.length > 0 ? '✓' : '✗';
      console.log(`${status} ${gameType}:`);
      console.log(`    사용 가능: ${available.join(', ') || '없음'}`);
      if (missing.length > 0) {
        console.log(`    부족: ${missing.join(', ')}`);
      }
    }

    console.log('\n=== 모든 테스트 완료 ===');

    return {
      total: GAME_TYPES.length,
      success: successCount,
      failed: failedCount,
      results
    };

  } catch (error) {
    console.error('테스트 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllGameTypes();
