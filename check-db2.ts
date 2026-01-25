import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  // 수학(초등) MATH_E의 3학년 1학기 성취기준 확인
  const mathSubject = await prisma.subject.findFirst({
    where: { code: 'MATH_E' }
  });
  
  console.log('수학(초등) Subject ID:', mathSubject?.id);
  
  const standards = await prisma.achievementStandard.findMany({
    where: {
      curriculumArea: {
        subjectId: mathSubject?.id
      },
      grade: 3,
      semester: 1
    },
    select: {
      code: true,
      description: true,
      grade: true,
      semester: true
    },
    take: 5
  });
  
  console.log('');
  console.log('수학 3학년 1학기 성취기준 (일부):');
  standards.forEach(s => {
    console.log(s.code, '-', s.description.slice(0, 50));
  });
  
  await prisma.$disconnect();
}
check().catch(console.error);
