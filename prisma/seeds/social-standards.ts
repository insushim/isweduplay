// 사회 성취기준 시드 데이터
// 2022 개정 교육과정 기반 - 교육부 공식 문서 교차 검증
// 사회는 3학년부터 시작

import { SubjectStandardsData } from './index'

export const socialStandards: SubjectStandardsData = {
  subjectCode: 'SOC',
  subjectName: '사회',
  standards: [
    // ===== 3학년 1학기 =====
    // 지리 인식
    {
      code: '[4사01-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '지리 인식',
      description: '우리 고장의 모습을 자유롭게 그려 보고, 서로 비교하여 공통점과 차이점을 찾아본다.',
      keyCompetencies: ['창의적 사고 역량', '의사소통 역량'],
    },
    {
      code: '[4사01-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '지리 인식',
      description: '디지털 영상 지도 등을 활용하여 주요 지형지물들의 위치를 파악하고, 백지도에 다시 배치해 본다.',
      keyCompetencies: ['지식정보처리 역량', '창의적 사고 역량'],
    },
    {
      code: '[4사01-03]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '지리 인식',
      description: '우리 고장의 지도를 보며 우리 지역을 안내하는 답사 자료를 만들어 본다.',
      keyCompetencies: ['창의적 사고 역량', '의사소통 역량'],
    },
    // 장소와 지역
    {
      code: '[4사02-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      areaName: '장소와 지역',
      description: '우리 고장의 지리적 특성과 관련된 환경 문제를 조사하여 발표한다.',
      keyCompetencies: ['지식정보처리 역량', '의사소통 역량'],
    },

    // ===== 3학년 2학기 =====
    // 장소와 지역
    {
      code: '[4사02-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '장소와 지역',
      description: '우리 고장과 다른 고장 사람들의 의식주 생활 모습을 비교하여 설명한다.',
      keyCompetencies: ['비판적 사고 역량', '공동체 역량'],
    },
    {
      code: '[4사02-03]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '장소와 지역',
      description: '우리 고장의 옛이야기, 노래, 문화유산 등을 조사하여 고장에 대한 자부심을 가진다.',
      keyCompetencies: ['지식정보처리 역량', '공동체 역량'],
    },
    // 경제
    {
      code: '[4사03-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '경제',
      description: '우리 고장의 다양한 중심지의 위치와 기능을 살펴보고, 사람들의 생활과의 관계를 탐색한다.',
      keyCompetencies: ['지식정보처리 역량', '창의적 사고 역량'],
    },
    {
      code: '[4사03-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      areaName: '경제',
      description: '교류하면서 가까워지는 고장들의 모습을 조사하여 교류의 중요성을 이해한다.',
      keyCompetencies: ['지식정보처리 역량', '공동체 역량'],
    },

    // ===== 4학년 1학기 =====
    // 지리 인식
    {
      code: '[4사01-04]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '지리 인식',
      description: '지도에 사용된 기호와 범례를 알고, 지도를 활용하여 촌락과 도시의 특징을 파악한다.',
      keyCompetencies: ['지식정보처리 역량', '창의적 사고 역량'],
    },
    {
      code: '[4사01-05]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '지리 인식',
      description: '우리 지역 지도를 보고 위치와 범위를 파악하고, 지역을 알 수 있는 지역 광고를 제작한다.',
      keyCompetencies: ['창의적 사고 역량', '의사소통 역량'],
    },
    // 장소와 지역
    {
      code: '[4사02-04]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      areaName: '장소와 지역',
      description: '우리 지역과 다른 지역의 자연환경을 비교하여 공통점과 차이점을 탐색한다.',
      keyCompetencies: ['비판적 사고 역량', '지식정보처리 역량'],
    },

    // ===== 4학년 2학기 =====
    // 경제
    {
      code: '[4사03-03]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '경제',
      description: '필요와 욕구에 따른 선택의 문제를 인식하고, 현명한 선택을 위한 기준을 탐색한다.',
      keyCompetencies: ['비판적 사고 역량', '자기관리 역량'],
    },
    {
      code: '[4사03-04]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '경제',
      description: '생산 활동의 의미와 생산 요소의 종류를 파악하고 생산에서의 기술 혁신의 중요성을 이해한다.',
      keyCompetencies: ['지식정보처리 역량', '창의적 사고 역량'],
    },
    // 정치
    {
      code: '[4사04-01]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '정치',
      description: '지역사회의 문제 해결을 위해 지역 주민들이 참여하는 다양한 방법을 탐색한다.',
      keyCompetencies: ['공동체 역량', '의사소통 역량'],
    },
    {
      code: '[4사04-02]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      areaName: '정치',
      description: '지역사회의 공공기관의 역할을 조사하고, 지역문제 해결을 위해 지역 주민으로서 참여하는 방법을 익힌다.',
      keyCompetencies: ['공동체 역량', '지식정보처리 역량'],
    },

    // ===== 5학년 1학기 =====
    // 지리 인식
    {
      code: '[6사01-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '지리 인식',
      description: '위치를 표현하는 방법을 알고, 우리나라 및 세계 여러 지역의 위치를 설명한다.',
      keyCompetencies: ['지식정보처리 역량', '의사소통 역량'],
    },
    {
      code: '[6사01-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '지리 인식',
      description: '다양한 축척과 종류의 지도를 비교하며, 목적에 맞게 지도를 활용하는 방법을 익힌다.',
      keyCompetencies: ['지식정보처리 역량', '비판적 사고 역량'],
    },
    // 장소와 지역
    {
      code: '[6사02-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '장소와 지역',
      description: '우리나라의 자연환경과 인문환경의 특성을 파악하고 환경에 적응하고 변화시킨 사례를 조사한다.',
      keyCompetencies: ['지식정보처리 역량', '창의적 사고 역량'],
    },
    {
      code: '[6사02-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      areaName: '장소와 지역',
      description: '우리나라 여러 지역의 자연환경과 인문환경의 특성을 비교하여 지역 간의 공통점과 차이점을 탐색한다.',
      keyCompetencies: ['비판적 사고 역량', '지식정보처리 역량'],
    },

    // ===== 5학년 2학기 =====
    // 역사
    {
      code: '[6사05-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '역사 일반',
      description: '역사적 사실의 의미와 역사 탐구의 방법을 파악하고, 역사를 배우는 이유를 설명한다.',
      keyCompetencies: ['지식정보처리 역량', '비판적 사고 역량'],
    },
    {
      code: '[6사05-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '역사 일반',
      description: '고조선과 여러 나라의 건국 이야기에서 당시 사람들의 생각이나 믿음을 파악한다.',
      keyCompetencies: ['비판적 사고 역량', '창의적 사고 역량'],
    },
    {
      code: '[6사05-03]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '역사 일반',
      description: '삼국이 각각 발전해 가는 모습을 이해하고, 삼국 간 경쟁과 교류의 모습을 조사한다.',
      keyCompetencies: ['지식정보처리 역량', '비판적 사고 역량'],
    },
    {
      code: '[6사05-04]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      areaName: '역사 일반',
      description: '삼국 통일과 발해 건국의 과정을 파악하고, 남북국 시대의 문화를 살펴본다.',
      keyCompetencies: ['지식정보처리 역량'],
    },

    // ===== 6학년 1학기 =====
    // 역사
    {
      code: '[6사05-05]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '역사 일반',
      description: '고려를 세운 과정과 후삼국을 통일한 과정을 이해하고, 고려의 개방적이고 다원적인 사회 모습을 탐색한다.',
      keyCompetencies: ['지식정보처리 역량', '비판적 사고 역량'],
    },
    {
      code: '[6사05-06]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '역사 일반',
      description: '고려가 외침을 극복해 가는 과정을 파악하고, 당시 사람들의 의지와 노력을 살펴본다.',
      keyCompetencies: ['비판적 사고 역량', '공동체 역량'],
    },
    {
      code: '[6사05-07]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '역사 일반',
      description: '조선의 건국 과정을 이해하고, 유교적 질서에 따른 사회 제도와 생활 모습을 탐색한다.',
      keyCompetencies: ['지식정보처리 역량', '비판적 사고 역량'],
    },
    {
      code: '[6사05-08]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      areaName: '역사 일반',
      description: '조선 시대 문화와 과학 발전의 모습을 파악하고, 세종 시대의 한글 창제가 갖는 의미를 이해한다.',
      keyCompetencies: ['창의적 사고 역량', '지식정보처리 역량'],
    },

    // ===== 6학년 2학기 =====
    // 역사 (근현대)
    {
      code: '[6사05-09]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '역사 일반',
      description: '조선 후기 정치, 경제, 사회, 문화의 변화를 이해하고, 서민 문화의 발달을 탐색한다.',
      keyCompetencies: ['지식정보처리 역량', '창의적 사고 역량'],
    },
    {
      code: '[6사05-10]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '역사 일반',
      description: '일제의 침략과 독립운동의 전개 과정을 이해하고, 독립을 위해 노력한 선조들의 활동을 조사한다.',
      keyCompetencies: ['지식정보처리 역량', '공동체 역량'],
    },
    {
      code: '[6사05-11]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '역사 일반',
      description: '광복 이후의 역사 전개 과정을 파악하고 민주주의가 발전해 온 과정을 이해한다.',
      keyCompetencies: ['비판적 사고 역량', '공동체 역량'],
    },
    // 정치
    {
      code: '[6사04-01]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '정치',
      description: '민주주의의 의미와 중요성을 파악하고, 일상생활에서 민주주의 원리를 적용할 수 있다.',
      keyCompetencies: ['공동체 역량', '의사소통 역량'],
    },
    {
      code: '[6사04-02]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '정치',
      description: '국민 주권의 의미와 국가의 구성 요소, 국가 기관의 역할을 파악하고 정치 참여의 방법을 탐색한다.',
      keyCompetencies: ['공동체 역량', '지식정보처리 역량'],
    },
    // 경제
    {
      code: '[6사03-01]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '경제',
      description: '경제활동에서 자유롭고 공정한 경쟁의 의미와 중요성을 이해하고 시장 경제 속에서 바람직한 경제활동 방법을 탐색한다.',
      keyCompetencies: ['비판적 사고 역량', '자기관리 역량'],
    },
    {
      code: '[6사03-02]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      areaName: '경제',
      description: '우리나라와 다른 나라 사이에 경제 교류가 이루어지는 까닭을 다양한 측면에서 탐구한다.',
      keyCompetencies: ['지식정보처리 역량', '공동체 역량'],
    },
  ],
}
