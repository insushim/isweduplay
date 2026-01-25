import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const subjects = await prisma.subject.findMany({
    select: { id: true, code: true, name: true }
  });
  console.log('Subjects:');
  for (const s of subjects) {
    console.log(s.id, s.code, s.name);
  }
  
  console.log('');
  console.log('Standards per Subject:');
  for (const subject of subjects) {
    const count = await prisma.achievementStandard.count({
      where: {
        curriculumArea: {
          subjectId: subject.id
        }
      }
    });
    console.log(subject.name, ':', count);
  }
  
  await prisma.$disconnect();
}
check().catch(console.error);
