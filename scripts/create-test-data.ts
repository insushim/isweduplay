import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  try {
    // 1. 기존 교사 찾기
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' }
    });

    if (!teacher) {
      console.log('교사 계정이 없습니다. 먼저 교사 계정을 생성하세요.');
      return;
    }
    console.log('교사 발견:', teacher.name, teacher.id);

    // 2. 과목 찾기
    const subject = await prisma.subject.findFirst();
    console.log('과목 발견:', subject?.name, subject?.id);

    // 3. 기존 퀴즈셋 찾거나 새로 생성
    let quizSet = await prisma.quizSet.findFirst({
      where: { title: '게임 테스트용 종합 퀴즈셋' }
    });

    if (!quizSet) {
      quizSet = await prisma.quizSet.create({
        data: {
          title: '게임 테스트용 종합 퀴즈셋',
          description: '모든 18개 게임 형식 테스트를 위한 다양한 문제 유형 포함',
          creatorId: teacher.id,
          subjectId: subject?.id || null,
          gradeGroup: 'ELEMENTARY_3_4',
          isPublic: true,
          isAIGenerated: false,
          tags: ['테스트', '종합', '게임'],
        }
      });
      console.log('퀴즈셋 새로 생성:', quizSet.id, quizSet.title);
    } else {
      console.log('기존 퀴즈셋 사용:', quizSet.id, quizSet.title);
      // 기존 연결된 문제가 있는지 확인
      const existingQuestions = await prisma.quizSetQuestion.count({
        where: { quizSetId: quizSet.id }
      });
      if (existingQuestions > 0) {
        console.log('이미 ' + existingQuestions + '개의 문제가 있습니다. 스킵합니다.');
        return;
      }
    }

    // 4. 다양한 유형의 문제 생성
    const questions = [
      // MULTIPLE_CHOICE (4개)
      { type: 'MULTIPLE_CHOICE', content: '대한민국의 수도는 어디입니까?', options: ['서울', '부산', '대구', '인천'], answer: '서울', answerExplanation: '서울은 대한민국의 수도입니다.', difficulty: 1, points: 100, timeLimit: 30 },
      { type: 'MULTIPLE_CHOICE', content: '1 + 1 = ?', options: ['1', '2', '3', '4'], answer: '2', answerExplanation: '1+1은 2입니다.', difficulty: 1, points: 100, timeLimit: 20 },
      { type: 'MULTIPLE_CHOICE', content: '물의 화학식은?', options: ['H2O', 'CO2', 'O2', 'N2'], answer: 'H2O', answerExplanation: '물은 수소 2개와 산소 1개로 이루어져 있습니다.', difficulty: 2, points: 150, timeLimit: 30 },
      { type: 'MULTIPLE_CHOICE', content: '태양계에서 가장 큰 행성은?', options: ['지구', '화성', '목성', '토성'], answer: '목성', answerExplanation: '목성은 태양계에서 가장 큰 행성입니다.', difficulty: 2, points: 150, timeLimit: 30 },

      // TRUE_FALSE (3개)
      { type: 'TRUE_FALSE', content: '지구는 태양 주위를 돕니다.', options: ['참', '거짓'], answer: '참', answerExplanation: '지구는 태양 주위를 공전합니다.', difficulty: 1, points: 80, timeLimit: 15 },
      { type: 'TRUE_FALSE', content: '달은 스스로 빛을 냅니다.', options: ['참', '거짓'], answer: '거짓', answerExplanation: '달은 태양빛을 반사합니다.', difficulty: 1, points: 80, timeLimit: 15 },
      { type: 'TRUE_FALSE', content: '한글은 세종대왕이 만들었습니다.', options: ['참', '거짓'], answer: '참', answerExplanation: '한글은 세종대왕이 1443년에 창제했습니다.', difficulty: 1, points: 80, timeLimit: 15 },

      // SHORT_ANSWER (3개)
      { type: 'SHORT_ANSWER', content: '대한민국 국기의 이름은?', options: [], answer: '태극기', answerExplanation: '대한민국의 국기는 태극기입니다.', difficulty: 2, points: 120, timeLimit: 30 },
      { type: 'SHORT_ANSWER', content: '7 x 8 = ?', options: [], answer: '56', answerExplanation: '7 곱하기 8은 56입니다.', difficulty: 2, points: 120, timeLimit: 20 },
      { type: 'SHORT_ANSWER', content: '봄, 여름, 가을 다음에 오는 계절은?', options: [], answer: '겨울', answerExplanation: '사계절은 봄, 여름, 가을, 겨울입니다.', difficulty: 1, points: 100, timeLimit: 20 },

      // FILL_IN_BLANK (2개)
      { type: 'FILL_IN_BLANK', content: '하늘은 [___]색입니다.', options: [], answer: '파란', answerExplanation: '맑은 날 하늘은 파란색입니다.', difficulty: 1, points: 100, timeLimit: 25 },
      { type: 'FILL_IN_BLANK', content: '우리나라의 화폐 단위는 [___]입니다.', options: [], answer: '원', answerExplanation: '대한민국의 화폐 단위는 원(₩)입니다.', difficulty: 1, points: 100, timeLimit: 25 },

      // ORDERING (2개)
      { type: 'ORDERING', content: '다음 숫자를 작은 것부터 순서대로 배열하세요: 5, 2, 8, 1', options: ['1', '2', '5', '8'], answer: '1,2,5,8', answerExplanation: '숫자를 오름차순으로 정렬하면 1, 2, 5, 8입니다.', difficulty: 2, points: 150, timeLimit: 40 },
      { type: 'ORDERING', content: '요일을 순서대로 배열하세요: 수요일, 월요일, 금요일', options: ['월요일', '수요일', '금요일'], answer: '월요일,수요일,금요일', answerExplanation: '요일 순서는 월, 화, 수, 목, 금, 토, 일입니다.', difficulty: 2, points: 150, timeLimit: 40 },

      // MATCHING (2개)
      { type: 'MATCHING', content: '동물과 그 소리를 연결하세요', options: ['강아지-멍멍', '고양이-야옹', '소-음메', '닭-꼬끼오'], answer: '강아지-멍멍,고양이-야옹,소-음메,닭-꼬끼오', answerExplanation: '각 동물의 울음소리입니다.', difficulty: 2, points: 200, timeLimit: 60 },
      { type: 'MATCHING', content: '나라와 수도를 연결하세요', options: ['한국-서울', '일본-도쿄', '중국-베이징', '미국-워싱턴'], answer: '한국-서울,일본-도쿄,중국-베이징,미국-워싱턴', answerExplanation: '각 나라의 수도입니다.', difficulty: 3, points: 200, timeLimit: 60 },
    ];

    // 문제 생성 및 퀴즈셋에 연결
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const question = await prisma.question.create({
        data: {
          type: q.type as any,
          content: q.content,
          options: q.options,
          answer: q.answer,
          answerExplanation: q.answerExplanation,
          difficulty: q.difficulty,
          points: q.points,
          timeLimit: q.timeLimit,
        }
      });

      // QuizSetQuestion 연결
      await prisma.quizSetQuestion.create({
        data: {
          quizSetId: quizSet.id,
          questionId: question.id,
          order: i + 1,
        }
      });
      console.log('문제 생성:', question.type, question.content.substring(0, 20) + '...');
    }

    console.log('\n=== 테스트 데이터 생성 완료 ===');
    console.log('퀴즈셋 ID:', quizSet.id);
    console.log('총 문제 수:', questions.length);

    // 최종 확인
    const finalCheck = await prisma.quizSet.findUnique({
      where: { id: quizSet.id },
      include: { questions: true }
    });
    console.log('연결된 문제 수:', finalCheck?.questions.length);

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
