import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkQuizSets() {
  console.log('=== QuizSet 데이터 확인 ===\n');

  // 1. 전체 퀴즈셋 수
  const totalCount = await prisma.quizSet.count();
  console.log(`전체 퀴즈셋 수: ${totalCount}\n`);

  // 2. 사용자별 퀴즈셋 수
  const quizSetsByUser = await prisma.quizSet.groupBy({
    by: ['creatorId'],
    _count: { id: true }
  });

  console.log('사용자별 퀴즈셋 수:');
  for (const group of quizSetsByUser) {
    const user = await prisma.user.findUnique({
      where: { id: group.creatorId },
      select: { id: true, email: true, name: true }
    });
    console.log(`  - ${user?.email || user?.name || group.creatorId}: ${group._count.id}개`);
  }

  console.log('\n');

  // 3. 전체 퀴즈셋 목록
  const allQuizSets = await prisma.quizSet.findMany({
    select: {
      id: true,
      title: true,
      creatorId: true,
      isPublic: true,
      createdAt: true,
      creator: {
        select: { email: true, name: true }
      },
      _count: {
        select: { questions: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('전체 퀴즈셋 목록:');
  allQuizSets.forEach((quiz, index) => {
    console.log(`${index + 1}. [${quiz.isPublic ? '공개' : '비공개'}] "${quiz.title}"`);
    console.log(`   - ID: ${quiz.id}`);
    console.log(`   - 생성자: ${quiz.creator?.email || quiz.creator?.name || quiz.creatorId}`);
    console.log(`   - 문제 수: ${quiz._count.questions}개`);
    console.log(`   - 생성일: ${quiz.createdAt.toLocaleString('ko-KR')}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkQuizSets().catch(console.error);
