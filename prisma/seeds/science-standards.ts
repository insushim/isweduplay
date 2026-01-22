// 과학 성취기준 시드 데이터
// 2022 개정 교육과정 기반 - 교육부 공식 문서 교차 검증
// 과학은 3학년부터 시작

import { SubjectStandardsData } from './index'

export const scienceStandards: SubjectStandardsData = {
  subjectCode: 'SCI',
  subjectName: '과학',
  standards: [
    // ===== 3학년 1학기 =====
    // 물질
    {
      code: '[4과01-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '물질',
      description: '여러 가지 물질을 선정하여 다양한 방법으로 분류하고, 물질의 성질을 활용하여 우리 생활에 필요한 물건을 설계할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '창의적 사고 역량'],
    },
    {
      code: '[4과01-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '물질',
      description: '서로 다른 물질을 섞었을 때 물질의 성질이 달라지거나 달라지지 않는 경우를 관찰하고, 혼합물 분리 방법을 설계할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '창의적 사고 역량'],
    },
    // 생명
    {
      code: '[4과02-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '생명',
      description: '주변 동물의 생김새와 생활 방식이 환경과 밀접한 관련이 있음을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[4과02-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '생명',
      description: '동물을 다양한 기준으로 분류하고, 동물의 특징에 따른 분류 기준을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '비판적 사고 역량'],
    },

    // ===== 3학년 2학기 =====
    // 운동과 에너지
    {
      code: '[4과03-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '운동과 에너지',
      description: '자석의 극을 찾고 자석 주위에 철로 된 물체가 끌려오는 현상을 관찰하여 자석의 성질을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[4과03-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '운동과 에너지',
      description: '두 자석 사이에 밀거나 당기는 힘이 작용하는 현상을 관찰하고 자석의 성질을 활용한 물건을 설계할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '창의적 사고 역량'],
    },
    // 지구와 우주
    {
      code: '[4과04-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '지구와 우주',
      description: '흙을 구성하는 알갱이를 관찰하여 흙의 생성 과정과 토양이 생물에게 주는 도움을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[4과04-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '지구와 우주',
      description: '지층과 화석의 생성 과정을 이해하고, 지층과 화석을 관찰하여 과거의 환경과 생물에 대해 추리할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '비판적 사고 역량'],
    },

    // ===== 4학년 1학기 =====
    // 물질
    {
      code: '[4과01-03]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '물질',
      description: '물이 얼거나 얼음이 녹을 때의 부피와 무게 변화를 관찰하여 물의 상태 변화를 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[4과01-04]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '물질',
      description: '물이 증발하거나 수증기가 응결하는 현상을 관찰하고 이러한 현상이 우리 생활에서 이용되는 예를 조사할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    // 생명
    {
      code: '[4과02-03]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '생명',
      description: '식물의 생김새와 생활 방식이 환경과 밀접한 관련이 있음을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[4과02-04]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '생명',
      description: '식물을 다양한 기준으로 분류하고, 식물의 특징에 따른 분류 기준을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '비판적 사고 역량'],
    },

    // ===== 4학년 2학기 =====
    // 운동과 에너지
    {
      code: '[4과03-03]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '운동과 에너지',
      description: '그림자가 생기는 조건을 이해하고 그림자의 크기 변화를 광원, 물체, 스크린 사이의 거리와 관련지어 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[4과03-04]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '운동과 에너지',
      description: '거울에 비친 물체의 모습을 관찰하여 거울에서 빛이 반사되는 성질을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    // 지구와 우주
    {
      code: '[4과04-03]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '지구와 우주',
      description: '하루 동안 지구에서 달과 별의 위치가 변하는 것을 지구의 자전으로 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[4과04-04]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '지구와 우주',
      description: '여러 날 동안 달의 모양과 위치 변화를 관찰하여 달의 공전을 이해할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },

    // ===== 5학년 1학기 =====
    // 운동과 에너지
    {
      code: '[6과03-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '운동과 에너지',
      description: '일정한 시간 동안 이동한 거리를 측정하여 물체의 빠르기를 비교할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[6과03-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '운동과 에너지',
      description: '물체의 속력을 구하고 속력을 비교하여 이동 거리와 시간의 관계를 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    // 지구와 우주
    {
      code: '[6과04-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '지구와 우주',
      description: '태양이 지구의 에너지원임을 이해하고, 태양과 지구 사이의 거리가 생명체가 살기에 적당한 기온을 만든다는 것을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[6과04-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '지구와 우주',
      description: '태양계를 구성하는 천체의 특징을 비교하여 행성을 분류할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '비판적 사고 역량'],
    },

    // ===== 5학년 2학기 =====
    // 물질
    {
      code: '[6과01-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '물질',
      description: '용질이 용매에 녹아 용액이 되는 현상을 관찰하고, 용해 현상을 입자적 관점에서 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[6과01-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '물질',
      description: '온도와 용질의 종류에 따른 용해도 차이를 활용하여 혼합물을 분리하는 방법을 설계할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '창의적 사고 역량'],
    },
    // 생명
    {
      code: '[6과02-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '생명',
      description: '생물의 구성 단계에 따라 세포, 조직, 기관, 개체 사이의 유기적인 관계를 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[6과02-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '생명',
      description: '식물과 동물 세포를 관찰하여 세포의 공통점과 차이점을 비교할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '비판적 사고 역량'],
    },

    // ===== 6학년 1학기 =====
    // 운동과 에너지
    {
      code: '[6과03-03]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '운동과 에너지',
      description: '일상생활에서 다양한 전기 회로를 찾아 전지, 전선, 전구의 연결 방법에 따른 특징을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[6과03-04]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '운동과 에너지',
      description: '전자석의 성질을 탐구하고, 전자석을 만들어 일상생활에서 활용되는 사례를 조사할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '창의적 사고 역량'],
    },
    // 생명
    {
      code: '[6과02-03]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '생명',
      description: '소화, 순환, 호흡, 배설 과정을 중심으로 각 기관계의 기능과 통합적 관계를 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[6과02-04]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '생명',
      description: '뼈와 근육이 유기적으로 작용하여 몸이 움직이는 원리를 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },

    // ===== 6학년 2학기 =====
    // 물질
    {
      code: '[6과01-03]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '물질',
      description: '산과 염기의 성질을 관찰하고, 지시약을 이용하여 여러 가지 용액을 분류할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '비판적 사고 역량'],
    },
    {
      code: '[6과01-04]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '물질',
      description: '산과 염기를 섞었을 때의 변화를 관찰하고 중화 반응의 특징을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    // 지구와 우주
    {
      code: '[6과04-03]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '지구와 우주',
      description: '계절에 따른 기온, 낮과 밤의 길이, 태양의 남중 고도 변화를 지구의 공전과 자전축의 기울기로 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[6과04-04]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '지구와 우주',
      description: '날씨에 영향을 주는 요소를 이해하고 습도, 이슬, 안개, 구름의 관계를 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[6과04-05]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '지구와 우주',
      description: '저기압과 고기압, 바람의 방향을 이해하고 일기도에서 날씨를 예측하여 생활에 적용할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '자기관리 역량'],
    },
    // 생명
    {
      code: '[6과02-05]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '생명',
      description: '생태계의 구성 요소와 역할을 이해하고, 비생물 환경 요인이 생물에게 미치는 영향을 설명할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[6과02-06]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '생명',
      description: '생태계 내에서 생물 사이의 먹이 관계를 설명하고, 생태계 평형이 유지되는 원리를 이해할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '지식정보처리 역량'],
    },
    {
      code: '[6과02-07]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '생명',
      description: '환경오염이 생물에게 미치는 영향을 이해하고, 생태계 보전을 위한 실천 방안을 제안할 수 있다.',
      keyCompetencies: ['과학적 탐구 역량', '공동체 역량'],
    },
  ],
}
