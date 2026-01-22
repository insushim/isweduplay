// 영어 성취기준 시드 데이터
// 2022 개정 교육과정 기반 - 교육부 공식 문서 교차 검증
// 영어는 3학년부터 시작

import { SubjectStandardsData } from './index'

export const englishStandards: SubjectStandardsData = {
  subjectCode: 'ENG',
  subjectName: '영어',
  standards: [
    // ===== 3학년 1학기 =====
    // 듣기
    {
      code: '[4영01-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '듣기',
      description: '알파벳 대소문자를 듣고 식별할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },
    {
      code: '[4영01-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '듣기',
      description: '영어의 강세, 리듬, 억양을 듣고 따라 말할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량'],
    },
    {
      code: '[4영01-03]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '듣기',
      description: '간단한 인사말이나 일상생활 표현을 듣고 이해할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '공동체 역량'],
    },
    // 말하기
    {
      code: '[4영02-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '말하기',
      description: '알파벳 대소문자를 바르게 발음할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량'],
    },
    {
      code: '[4영02-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '말하기',
      description: '간단한 인사말을 주고받을 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '공동체 역량'],
    },
    {
      code: '[4영02-03]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '말하기',
      description: '자신의 이름을 소개할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },
    // 읽기
    {
      code: '[4영03-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '읽기',
      description: '알파벳 대소문자를 식별하여 읽을 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    // 쓰기
    {
      code: '[4영04-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '쓰기',
      description: '알파벳 대소문자를 바르게 쓸 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },

    // ===== 3학년 2학기 =====
    // 듣기
    {
      code: '[4영01-04]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '듣기',
      description: '쉽고 간단한 낱말이나 어구를 듣고 이해할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    {
      code: '[4영01-05]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '듣기',
      description: '그림, 사진, 동작에 관한 간단한 표현을 듣고 이해할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '창의적 사고 역량'],
    },
    // 말하기
    {
      code: '[4영02-04]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '말하기',
      description: '쉽고 간단한 낱말이나 어구를 따라 말할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량'],
    },
    {
      code: '[4영02-05]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '말하기',
      description: '그림, 사진, 동작에 관해 한두 문장으로 말할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '창의적 사고 역량'],
    },
    // 읽기
    {
      code: '[4영03-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '읽기',
      description: '소리와 철자의 관계를 이해하고 낱말을 읽을 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    // 쓰기
    {
      code: '[4영04-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '쓰기',
      description: '구두로 익힌 낱말을 따라 쓸 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },

    // ===== 4학년 1학기 =====
    // 듣기
    {
      code: '[4영01-06]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '듣기',
      description: '주변 사물과 사람에 관한 쉽고 간단한 문장을 듣고 이해할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    {
      code: '[4영01-07]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '듣기',
      description: '일상생활에 관한 쉽고 간단한 말이나 대화를 듣고 이해할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '공동체 역량'],
    },
    // 말하기
    {
      code: '[4영02-06]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '말하기',
      description: '주변 사물과 사람에 관해 한두 문장으로 말할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    {
      code: '[4영02-07]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '말하기',
      description: '일상생활에 관해 간단한 표현으로 묻고 답할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '공동체 역량'],
    },
    // 읽기
    {
      code: '[4영03-03]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '읽기',
      description: '쉽고 간단한 낱말이나 어구를 읽고 의미를 이해할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    // 쓰기
    {
      code: '[4영04-03]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '쓰기',
      description: '쉽고 간단한 낱말이나 어구를 쓸 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },

    // ===== 4학년 2학기 =====
    // 듣기
    {
      code: '[4영01-08]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '듣기',
      description: '간단한 지시나 설명을 듣고 이해할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },
    // 말하기
    {
      code: '[4영02-08]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '말하기',
      description: '간단한 노래, 챈트, 놀이 활동에 참여할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '공동체 역량', '심미적 감성 역량'],
    },
    // 읽기
    {
      code: '[4영03-04]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '읽기',
      description: '쉽고 간단한 문장을 읽고 의미를 이해할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    // 쓰기
    {
      code: '[4영04-04]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '쓰기',
      description: '실물, 그림, 사진을 보고 쉽고 간단한 낱말이나 어구를 쓸 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '창의적 사고 역량'],
    },

    // ===== 5학년 1학기 =====
    // 듣기
    {
      code: '[6영01-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '듣기',
      description: '일상생활 관련 주제에 관한 간단한 말이나 대화를 듣고 세부 정보를 파악할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    {
      code: '[6영01-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '듣기',
      description: '일상생활 관련 주제에 관한 간단한 말이나 대화를 듣고 주제 및 요지를 파악할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    // 말하기
    {
      code: '[6영02-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '말하기',
      description: '주변의 사람, 사물, 장소에 관해 간단히 묻고 답할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '공동체 역량'],
    },
    {
      code: '[6영02-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '말하기',
      description: '일상생활에 관해 짧고 간단한 표현으로 묻고 답할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '공동체 역량'],
    },
    // 읽기
    {
      code: '[6영03-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '읽기',
      description: '쉽고 간단한 문장을 소리 내어 유창하게 읽을 수 있다.',
      keyCompetencies: ['영어 의사소통 역량'],
    },
    {
      code: '[6영03-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '읽기',
      description: '일상생활에 관한 짧고 쉬운 글을 읽고 세부 정보를 파악할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    // 쓰기
    {
      code: '[6영04-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '쓰기',
      description: '구두로 익힌 문장을 쓸 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },

    // ===== 5학년 2학기 =====
    // 듣기
    {
      code: '[6영01-03]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '듣기',
      description: '그림, 도표, 실물 등에 관한 간단한 말이나 대화를 듣고 이해할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    {
      code: '[6영01-04]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '듣기',
      description: '간단한 말이나 대화를 듣고 일의 순서를 파악할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    // 말하기
    {
      code: '[6영02-03]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '말하기',
      description: '그림, 도표, 실물 등에 관해 간단히 묻고 답할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '창의적 사고 역량'],
    },
    {
      code: '[6영02-04]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '말하기',
      description: '지시나 설명하는 말을 할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },
    // 읽기
    {
      code: '[6영03-03]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '읽기',
      description: '일상생활에 관한 짧고 쉬운 글을 읽고 주제 및 요지를 파악할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    // 쓰기
    {
      code: '[6영04-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '쓰기',
      description: '실물, 그림, 도표를 보고 간단한 문장을 쓸 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '창의적 사고 역량'],
    },

    // ===== 6학년 1학기 =====
    // 듣기
    {
      code: '[6영01-05]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '듣기',
      description: '간단한 말이나 대화를 듣고 목적을 파악할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    {
      code: '[6영01-06]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '듣기',
      description: '간단한 말이나 대화를 듣고 화자의 의도나 감정을 파악할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '공동체 역량'],
    },
    // 말하기
    {
      code: '[6영02-05]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '말하기',
      description: '자신의 경험이나 계획에 관해 간단히 말할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },
    {
      code: '[6영02-06]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '말하기',
      description: '자신의 의견이나 감정을 표현할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },
    // 읽기
    {
      code: '[6영03-04]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '읽기',
      description: '짧고 쉬운 글을 읽고 일의 순서나 전후 관계를 파악할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    // 쓰기
    {
      code: '[6영04-03]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '쓰기',
      description: '간단한 초대, 감사, 축하 등의 글을 쓸 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '공동체 역량'],
    },

    // ===== 6학년 2학기 =====
    // 듣기
    {
      code: '[6영01-07]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '듣기',
      description: '다양한 매체에서 흘러나오는 간단한 말이나 대화를 듣고 이해할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    // 말하기
    {
      code: '[6영02-07]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '말하기',
      description: '간단한 역할 놀이를 할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '창의적 사고 역량', '공동체 역량'],
    },
    {
      code: '[6영02-08]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '말하기',
      description: '일상생활에 관한 주제에 대해 짧게 발표할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },
    // 읽기
    {
      code: '[6영03-05]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '읽기',
      description: '짧고 쉬운 글을 읽고 목적이나 의도를 파악할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '지식정보처리 역량'],
    },
    {
      code: '[6영03-06]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '읽기',
      description: '일상생활에 관한 짧고 쉬운 글을 읽고 자신의 의견을 말할 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '비판적 사고 역량'],
    },
    // 쓰기
    {
      code: '[6영04-04]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '쓰기',
      description: '간단한 자기소개 글을 쓸 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '자기관리 역량'],
    },
    {
      code: '[6영04-05]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '쓰기',
      description: '예시문을 참고하여 간단한 글을 쓸 수 있다.',
      keyCompetencies: ['영어 의사소통 역량', '창의적 사고 역량'],
    },
  ],
}
