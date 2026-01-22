// 수학 성취기준 - 2022 개정 교육과정
// 출처: 교육부 고시 제2022-33호, 국가교육과정정보센터(NCIC), 한국교육과정평가원
// 총 121개 성취기준 (1-2학년군 29개, 3-4학년군 47개, 5-6학년군 45개)

import { SubjectStandardsData } from './index'

export const mathStandards: SubjectStandardsData = {
  subjectCode: 'MATH',
  subjectName: '수학',
  standards: [
    // =====================================================
    // 1-2학년군 (29개)
    // =====================================================

    // ==================== 1학년 1학기 ====================
    // 수와 연산 영역
    {
      code: '[2수01-01]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 1,
      description: '0과 100까지의 수 개념을 이해하고, 수를 세고 읽고 쓸 수 있다.',
      explanation: '구체물의 수를 세어 보는 활동을 통해 수 개념을 이해하고, 수를 읽고 쓰는 방법을 익힌다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[2수01-02]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 1,
      description: '일, 이, 삼, 사, 오, 육, 칠, 팔, 구의 순서를 알고, 수의 순서와 크기를 비교할 수 있다.',
      explanation: '수의 순서를 이해하고 두 수의 크기를 비교하는 방법을 익힌다.',
      keyCompetencies: ['추론', '문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[2수01-03]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 1,
      description: '하나의 수를 두 수로 분해하고 두 수를 하나의 수로 합성하는 활동을 통해 수 감각을 기른다.',
      explanation: '9 이하의 수를 두 수로 가르고 모으는 활동을 통해 덧셈과 뺄셈의 기초를 다진다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '수와 연산'
    },
    {
      code: '[2수01-04]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 1,
      description: '덧셈과 뺄셈이 이루어지는 실생활 상황을 통해 덧셈과 뺄셈의 의미를 이해한다.',
      explanation: '구체적인 상황에서 합치기, 덜어내기 등의 활동을 통해 연산의 의미를 파악한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[2수01-05]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 1,
      description: '한 자리 수의 덧셈과 뺄셈을 할 수 있다.',
      explanation: '받아올림과 받아내림이 없는 한 자리 수의 덧셈과 뺄셈을 계산한다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[2수02-01]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 1,
      description: '교실 및 생활 주변에서 여러 가지 물건을 관찰하여 상자, 둥근 기둥, 공 모양을 찾고, 그 특징을 말할 수 있다.',
      explanation: '주변의 물건에서 기본적인 입체도형의 모양을 찾아보는 활동을 한다.',
      keyCompetencies: ['창의·융합', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[2수02-02]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 1,
      description: '양의 비교를 통하여 길이, 들이, 무게, 넓이의 기초적인 개념을 이해한다.',
      explanation: '두 양을 직접 비교하여 길고 짧음, 많고 적음 등을 비교한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },

    // ==================== 1학년 2학기 ====================
    // 수와 연산 영역
    {
      code: '[2수01-06]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 2,
      description: '두 자리 수의 범위에서 덧셈과 뺄셈의 계산 원리를 이해하고 계산할 수 있다.',
      explanation: '받아올림이 없는 두 자리 수의 덧셈과 받아내림이 없는 뺄셈을 할 수 있다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '수와 연산'
    },
    {
      code: '[2수01-07]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 2,
      description: '덧셈과 뺄셈의 관계를 이해한다.',
      explanation: '덧셈식을 뺄셈식으로, 뺄셈식을 덧셈식으로 바꾸어 나타낼 수 있다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[2수02-03]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 2,
      description: '삼각형, 사각형, 원을 직관적으로 이해하고 그 모양을 찾을 수 있다.',
      explanation: '평면도형의 기본 모양을 인식하고 주변에서 해당 모양을 찾는다.',
      keyCompetencies: ['창의·융합', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[2수02-04]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 2,
      description: "시계를 보고 시각을 '몇 시', '몇 시 30분'으로 읽을 수 있다.",
      explanation: '시계의 긴 바늘과 짧은 바늘을 이해하고 정각과 30분 단위로 시각을 읽는다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '도형과 측정'
    },
    // 변화와 관계 영역
    {
      code: '[2수03-01]',
      gradeGroup: '1-2',
      grade: 1,
      semester: 2,
      description: '물체, 무늬, 수 등의 배열에서 규칙을 찾아 여러 가지 방법으로 나타낼 수 있다.',
      explanation: '반복되는 규칙을 찾고 규칙에 따라 배열을 만들어 본다.',
      keyCompetencies: ['추론', '창의·융합'],
      areaName: '변화와 관계'
    },

    // ==================== 2학년 1학기 ====================
    // 수와 연산 영역
    {
      code: '[2수01-08]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 1,
      description: '네 자리 이하의 수를 알고, 자릿값과 위치적 기수법을 이해하고 수를 읽고 쓸 수 있다.',
      explanation: '천, 백, 십, 일의 자릿값을 이해하고 네 자리 수를 읽고 쓴다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[2수01-09]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 1,
      description: '받아올림이 있는 두 자리 수의 덧셈과 받아내림이 있는 두 자리 수의 뺄셈의 계산 원리를 이해하고 계산할 수 있다.',
      explanation: '세로 형식의 계산 방법을 익히고 계산한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[2수02-05]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 1,
      description: '삼각형, 사각형, 원의 구성 요소와 그 특징을 탐구하고 설명할 수 있다.',
      explanation: '변, 꼭짓점 등 평면도형의 구성 요소를 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[2수02-06]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 1,
      description: '1cm와 1m의 단위를 알고, 길이를 재고 어림할 수 있다.',
      explanation: '길이의 표준 단위를 이해하고 자를 사용하여 길이를 잰다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[2수02-07]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 1,
      description: "시계를 보고 시각을 '몇 시 몇 분'으로 읽을 수 있다.",
      explanation: '5분 단위, 1분 단위로 시각을 읽는다.',
      keyCompetencies: ['문제 해결'],
      areaName: '도형과 측정'
    },

    // ==================== 2학년 2학기 ====================
    // 수와 연산 영역
    {
      code: '[2수01-10]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '곱셈이 이루어지는 실생활 상황을 통해 곱셈의 의미를 이해한다.',
      explanation: '같은 수를 여러 번 더하는 상황을 곱셈으로 나타내는 것을 이해한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[2수01-11]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '곱셈구구를 이해하고 한 자리 수의 곱셈을 할 수 있다.',
      explanation: '곱셈구구표를 만들어 보고, 곱셈구구를 외운다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[2수02-08]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '상자, 둥근 기둥, 공 모양의 구성 요소와 그 특징을 탐구하고 설명할 수 있다.',
      explanation: '면, 모서리, 꼭짓점 등 입체도형의 구성 요소를 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[2수02-09]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: "시각과 시간을 구분하고, '몇 시간', '몇 분', '몇 초'의 관계를 이해한다.",
      explanation: '1시간=60분, 1분=60초의 관계를 이해한다.',
      keyCompetencies: ['추론', '문제 해결'],
      areaName: '도형과 측정'
    },
    {
      code: '[2수02-10]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '길이를 재어 어림할 수 있고, 길이의 합과 차를 구할 수 있다.',
      explanation: '길이의 덧셈과 뺄셈을 할 수 있다.',
      keyCompetencies: ['문제 해결'],
      areaName: '도형과 측정'
    },
    {
      code: '[2수02-11]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '쌓기나무를 사용하여 여러 가지 입체 모양을 만들고, 그 위치와 방향을 설명할 수 있다.',
      explanation: '공간 감각을 기르고 위치를 설명하는 말을 익힌다.',
      keyCompetencies: ['창의·융합', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[2수02-12]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '여러 가지 모양의 평면도형과 그 평면도형으로 이루어진 무늬를 탐색하고 설명할 수 있다.',
      explanation: '평면도형으로 모양 만들기를 하고 특징을 설명한다.',
      keyCompetencies: ['창의·융합', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[2수02-13]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '1m보다 긴 길이를 이해하고, m와 cm의 관계를 알 수 있다.',
      explanation: '1m = 100cm 관계를 이해하고 길이 단위를 환산한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '도형과 측정'
    },
    // 변화와 관계 영역
    {
      code: '[2수03-02]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '수의 배열에서 규칙을 찾아 다양한 방법으로 표현할 수 있다.',
      explanation: '수의 규칙을 찾고 규칙에 따라 수를 나열한다.',
      keyCompetencies: ['추론', '창의·융합'],
      areaName: '변화와 관계'
    },
    // 자료와 가능성 영역
    {
      code: '[2수04-01]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '분류한 자료를 표로 나타내고, 표를 보고 자료의 특성을 말할 수 있다.',
      explanation: '자료를 분류하고 표로 정리하여 특성을 파악한다.',
      keyCompetencies: ['정보 처리', '의사소통'],
      areaName: '자료와 가능성'
    },
    {
      code: '[2수04-02]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '분류한 자료를 ○, × 등을 이용하여 그래프로 나타내고, 그래프를 보고 자료의 특성을 말할 수 있다.',
      explanation: '간단한 그림그래프를 만들고 해석한다.',
      keyCompetencies: ['정보 처리', '의사소통'],
      areaName: '자료와 가능성'
    },
    {
      code: '[2수04-03]',
      gradeGroup: '1-2',
      grade: 2,
      semester: 2,
      description: '일이 일어날 가능성을 말로 나타내고, 가능성의 정도를 비교할 수 있다.',
      explanation: '가능성의 의미를 이해하고 일상적인 언어로 표현한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '자료와 가능성'
    },

    // =====================================================
    // 3-4학년군 (47개)
    // =====================================================

    // ==================== 3학년 1학기 ====================
    // 수와 연산 영역
    {
      code: '[4수01-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      description: '다섯 자리 이상의 큰 수를 알고, 읽고 쓸 수 있다.',
      explanation: '만, 십만, 백만, 천만, 억 등 큰 수의 자릿값을 이해한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      description: '세 자리 수의 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '받아올림과 받아내림이 있는 세 자리 수의 연산을 할 수 있다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-03]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      description: '(두 자리 수)×(한 자리 수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '곱셈의 세로 형식 계산 방법을 익힌다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[4수02-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      description: '직선, 반직선, 선분을 이해하고 구별할 수 있다.',
      explanation: '직선, 반직선, 선분의 개념과 차이를 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-02]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      description: '각과 직각을 이해하고, 직각삼각형과 직사각형, 정사각형을 이해한다.',
      explanation: '각의 개념을 이해하고, 직각이 있는 도형을 탐구한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-03]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      description: '1mm와 1km의 단위를 알고, 길이를 재고 어림할 수 있다.',
      explanation: '다양한 단위의 길이를 이해하고 단위 변환을 한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-04]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      description: '시간의 덧셈과 뺄셈을 할 수 있다.',
      explanation: '시, 분, 초의 덧셈과 뺄셈을 할 수 있다.',
      keyCompetencies: ['문제 해결'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-05]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 1,
      description: '평면도형의 이동을 이해하고 밀기, 뒤집기, 돌리기를 설명할 수 있다.',
      explanation: '도형의 위치 변환을 이해한다.',
      keyCompetencies: ['추론', '창의·융합'],
      areaName: '도형과 측정'
    },

    // ==================== 3학년 2학기 ====================
    // 수와 연산 영역
    {
      code: '[4수01-04]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      description: '나눗셈이 이루어지는 실생활 상황을 통해 나눗셈의 의미를 이해한다.',
      explanation: '똑같이 나누기와 몇 개씩 나누기 상황에서 나눗셈의 의미를 이해한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-05]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      description: '곱셈과 나눗셈의 관계를 이해한다.',
      explanation: '곱셈식과 나눗셈식의 관계를 파악한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-06]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      description: '(세 자리 수)×(한 자리 수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '세로 형식의 곱셈 계산 방법을 익힌다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-07]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      description: '(두 자리 수)÷(한 자리 수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '나눗셈의 세로 형식 계산 방법을 익힌다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[4수02-06]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      description: '원의 구성 요소를 이해하고, 원의 성질을 탐구하여 설명할 수 있다.',
      explanation: '원의 중심, 반지름, 지름의 개념을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-07]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      description: '들이를 이해하고 1L와 1mL의 단위를 알며, 들이를 재고 어림할 수 있다.',
      explanation: '들이의 단위를 이해하고 측정한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-08]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      description: '무게를 이해하고 1g과 1kg의 단위를 알며, 무게를 재고 어림할 수 있다.',
      explanation: '무게의 단위를 이해하고 측정한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '도형과 측정'
    },
    // 자료와 가능성 영역
    {
      code: '[4수04-01]',
      gradeGroup: '3-4',
      grade: 3,
      semester: 2,
      description: '자료를 수집하여 간단한 그림그래프나 막대그래프로 나타낼 수 있다.',
      explanation: '자료를 그래프로 나타내고 해석한다.',
      keyCompetencies: ['정보 처리', '의사소통'],
      areaName: '자료와 가능성'
    },

    // ==================== 4학년 1학기 ====================
    // 수와 연산 영역
    {
      code: '[4수01-08]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      description: '(두 자리 수)×(두 자리 수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '두 자리 수끼리의 곱셈을 익힌다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-09]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      description: '(세 자리 수)×(두 자리 수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '두 자리 수의 곱셈을 익힌다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-10]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      description: '(세 자리 수)÷(한 자리 수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '나눗셈의 세로 형식 계산 방법을 익힌다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[4수02-09]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      description: '각도의 개념을 이해하고, 각도의 크기를 재고 어림할 수 있다.',
      explanation: '각도기를 사용하여 각도를 측정하고 그린다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-10]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      description: '삼각형의 세 각의 크기의 합이 180°임을 이해한다.',
      explanation: '삼각형의 내각의 합을 탐구한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-11]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      description: '여러 가지 삼각형을 변의 길이나 각의 크기에 따라 분류할 수 있다.',
      explanation: '이등변삼각형, 정삼각형, 예각삼각형, 둔각삼각형 등을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-12]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      description: '사각형의 네 각의 크기의 합이 360°임을 이해한다.',
      explanation: '사각형의 내각의 합을 탐구한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    // 변화와 관계 영역
    {
      code: '[4수03-01]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 1,
      description: '다양한 변화 규칙을 찾아 설명하고, 그 규칙을 수나 식으로 나타낼 수 있다.',
      explanation: '수의 배열에서 규칙을 찾아 식으로 표현한다.',
      keyCompetencies: ['추론', '창의·융합'],
      areaName: '변화와 관계'
    },

    // ==================== 4학년 2학기 ====================
    // 수와 연산 영역
    {
      code: '[4수01-11]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '분수를 이해하고, 읽고 쓸 수 있다.',
      explanation: '분수의 의미와 표현 방법을 이해한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-12]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '단위분수, 진분수, 가분수, 대분수를 이해하고 그 관계를 안다.',
      explanation: '다양한 분수의 종류를 이해하고 구별한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-13]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '분모가 같은 분수의 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '분모가 같은 분수의 덧셈과 뺄셈을 한다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-14]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '소수를 이해하고, 읽고 쓸 수 있다.',
      explanation: '소수의 의미와 표현 방법을 이해한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-15]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '소수 사이의 관계를 이해한다.',
      explanation: '소수의 크기 비교와 자릿값을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[4수01-16]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '소수의 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '소수의 덧셈과 뺄셈을 한다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[4수02-13]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '수직과 수선을 이해하고, 수선을 그을 수 있다.',
      explanation: '수직과 수선의 개념을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-14]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '평행과 평행선을 이해하고, 평행선 사이의 거리를 알 수 있다.',
      explanation: '평행과 평행선의 개념을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-15]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '여러 가지 사각형을 변의 길이나 각의 크기 또는 평행의 유무에 따라 분류할 수 있다.',
      explanation: '사다리꼴, 평행사변형, 마름모 등을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-16]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '여러 가지 사각형의 성질을 이해하고 설명할 수 있다.',
      explanation: '여러 가지 사각형의 성질과 관계를 탐구한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-17]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '다각형을 이해하고 정다각형의 성질을 탐구하여 설명할 수 있다.',
      explanation: '다각형과 정다각형의 개념을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-18]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '넓이의 의미를 이해하고 단위넓이의 필요성을 인식한다.',
      explanation: '넓이 단위의 필요성을 이해한다.',
      keyCompetencies: ['추론', '문제 해결'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-19]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '1㎠와 1㎡의 단위를 알고, 넓이를 재고 어림할 수 있다.',
      explanation: '넓이의 단위를 이해하고 측정한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[4수02-20]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '직사각형의 둘레와 넓이를 구하는 방법을 이해하고 이를 구할 수 있다.',
      explanation: '직사각형의 둘레와 넓이 공식을 이해하고 적용한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '도형과 측정'
    },
    // 변화와 관계 영역
    {
      code: '[4수03-02]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '두 양 사이의 대응 관계를 나타낸 표에서 규칙을 찾아 설명할 수 있다.',
      explanation: '대응 관계의 규칙을 찾고 설명한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '변화와 관계'
    },
    {
      code: '[4수03-03]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '두 양 사이의 대응 관계를 □, △ 등을 사용하여 식으로 나타낼 수 있다.',
      explanation: '대응 관계를 식으로 표현한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '변화와 관계'
    },
    // 자료와 가능성 영역
    {
      code: '[4수04-02]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '연속적인 변량에 대한 자료를 수집하여 꺾은선그래프로 나타낼 수 있다.',
      explanation: '시간에 따른 변화를 꺾은선그래프로 표현하고 해석한다.',
      keyCompetencies: ['정보 처리', '의사소통'],
      areaName: '자료와 가능성'
    },
    {
      code: '[4수04-03]',
      gradeGroup: '3-4',
      grade: 4,
      semester: 2,
      description: '여러 가지 자료를 수집, 분류, 정리하여 목적에 맞는 그래프로 나타내고 그래프를 해석할 수 있다.',
      explanation: '목적에 맞는 그래프를 선택하여 나타낸다.',
      keyCompetencies: ['정보 처리', '의사소통'],
      areaName: '자료와 가능성'
    },

    // =====================================================
    // 5-6학년군 (45개)
    // =====================================================

    // ==================== 5학년 1학기 ====================
    // 수와 연산 영역
    {
      code: '[6수01-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      description: '자연수의 혼합 계산에서 연산의 순서를 알고 계산할 수 있다.',
      explanation: '괄호, 곱셈·나눗셈, 덧셈·뺄셈의 계산 순서를 이해한다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      description: '약수, 공약수, 최대공약수의 의미를 알고 구할 수 있다.',
      explanation: '약수와 공약수, 최대공약수의 개념을 이해하고 구한다.',
      keyCompetencies: ['추론', '문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-03]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      description: '배수, 공배수, 최소공배수의 의미를 알고 구할 수 있다.',
      explanation: '배수와 공배수, 최소공배수의 개념을 이해하고 구한다.',
      keyCompetencies: ['추론', '문제 해결'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[6수02-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      description: '직육면체와 정육면체를 이해하고, 구성 요소와 성질을 탐구하여 설명할 수 있다.',
      explanation: '직육면체와 정육면체의 성질을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      description: '직육면체와 정육면체의 전개도를 그릴 수 있다.',
      explanation: '전개도의 의미를 이해하고 그린다.',
      keyCompetencies: ['추론', '창의·융합'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-03]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      description: '평면도형의 둘레의 의미를 이해하고 구할 수 있다.',
      explanation: '둘레의 의미를 이해하고 구한다.',
      keyCompetencies: ['문제 해결'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-04]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      description: '직사각형의 넓이를 구하는 방법을 이해하고 이를 구할 수 있다.',
      explanation: '직사각형의 넓이 공식을 이해하고 적용한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '도형과 측정'
    },
    // 변화와 관계 영역
    {
      code: '[6수03-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 1,
      description: '두 양 사이의 대응 관계를 나타낸 표에서 규칙을 찾아 □, △ 등을 사용하여 식으로 나타낼 수 있다.',
      explanation: '대응 관계를 식으로 표현한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '변화와 관계'
    },

    // ==================== 5학년 2학기 ====================
    // 수와 연산 영역
    {
      code: '[6수01-04]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      description: '크기가 같은 분수를 이해하고 약분과 통분을 할 수 있다.',
      explanation: '약분과 통분의 방법을 이해하고 적용한다.',
      keyCompetencies: ['추론', '문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-05]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      description: '분수의 크기를 비교할 수 있다.',
      explanation: '분모가 다른 분수의 크기를 비교한다.',
      keyCompetencies: ['추론', '문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-06]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      description: '분모가 다른 분수의 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '통분하여 분수의 덧셈과 뺄셈을 한다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-07]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      description: '(분수)×(자연수), (자연수)×(분수), (분수)×(분수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '분수의 곱셈 원리를 이해하고 계산한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[6수02-05]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      description: '합동을 이해하고 합동인 도형의 성질을 탐구하여 설명할 수 있다.',
      explanation: '합동인 도형의 대응 요소를 파악한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-06]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      description: '선대칭도형과 점대칭도형을 이해하고 그릴 수 있다.',
      explanation: '선대칭과 점대칭 도형을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-07]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      description: '평행사변형, 삼각형, 사다리꼴의 넓이를 구하는 방법을 이해하고 이를 구할 수 있다.',
      explanation: '다양한 도형의 넓이 공식을 이해하고 적용한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-08]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      description: '마름모의 넓이를 구하는 방법을 이해하고 이를 구할 수 있다.',
      explanation: '마름모의 넓이 공식을 이해하고 적용한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '도형과 측정'
    },
    // 자료와 가능성 영역
    {
      code: '[6수04-01]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      description: '평균의 의미를 알고 주어진 자료의 평균을 구할 수 있다.',
      explanation: '평균의 개념을 이해하고 계산한다.',
      keyCompetencies: ['문제 해결', '정보 처리'],
      areaName: '자료와 가능성'
    },
    {
      code: '[6수04-02]',
      gradeGroup: '5-6',
      grade: 5,
      semester: 2,
      description: '평균을 이용하여 문제를 해결할 수 있다.',
      explanation: '평균을 활용하여 실생활 문제를 해결한다.',
      keyCompetencies: ['문제 해결', '정보 처리'],
      areaName: '자료와 가능성'
    },

    // ==================== 6학년 1학기 ====================
    // 수와 연산 영역
    {
      code: '[6수01-08]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      description: '(분수)÷(자연수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '분수의 나눗셈 원리를 이해하고 계산한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-09]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      description: '(자연수)÷(분수), (분수)÷(분수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '분수의 나눗셈 원리를 이해하고 계산한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-10]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      description: '소수의 곱셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '소수의 곱셈을 한다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-11]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      description: '소수의 나눗셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      explanation: '소수의 나눗셈을 한다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[6수02-09]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      description: '각기둥을 이해하고, 구성 요소와 성질을 탐구하여 설명할 수 있다.',
      explanation: '각기둥의 구성 요소를 파악한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-10]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      description: '각뿔을 이해하고, 구성 요소와 성질을 탐구하여 설명할 수 있다.',
      explanation: '각뿔의 구성 요소를 파악한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-11]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      description: '원주와 원주율의 의미를 이해하고, 원의 둘레를 구할 수 있다.',
      explanation: '원주율을 이해하고 원의 둘레를 구한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-12]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      description: '원의 넓이를 구하는 방법을 이해하고 이를 구할 수 있다.',
      explanation: '원의 넓이 공식을 이해하고 적용한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '도형과 측정'
    },
    // 변화와 관계 영역
    {
      code: '[6수03-02]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      description: '비의 의미를 이해하고 실생활에서 두 양의 비를 나타낼 수 있다.',
      explanation: '비의 개념을 이해하고 활용한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '변화와 관계'
    },
    {
      code: '[6수03-03]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 1,
      description: '비율을 이해하고, 비율을 분수, 소수, 백분율로 나타낼 수 있다.',
      explanation: '비율의 의미를 이해하고 다양하게 나타낸다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '변화와 관계'
    },

    // ==================== 6학년 2학기 ====================
    // 수와 연산 영역
    {
      code: '[6수01-12]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '분수와 소수의 혼합 계산에서 연산의 순서를 알고 계산할 수 있다.',
      explanation: '분수와 소수가 섞인 계산을 한다.',
      keyCompetencies: ['문제 해결'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-13]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '분수와 소수의 관계를 이해하고 서로 바꾸어 나타낼 수 있다.',
      explanation: '분수와 소수의 상호 변환을 한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-14]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '정수와 유리수의 개념을 이해한다.',
      explanation: '양수, 음수, 정수, 유리수의 개념을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '수와 연산'
    },
    {
      code: '[6수01-15]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '수의 범위를 이해하고 이상, 이하, 초과, 미만의 의미를 안다.',
      explanation: '수의 범위를 나타내는 말을 이해한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '수와 연산'
    },
    // 도형과 측정 영역
    {
      code: '[6수02-13]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '원기둥을 이해하고, 구성 요소와 성질을 탐구하여 설명할 수 있다.',
      explanation: '원기둥의 구성 요소를 파악한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-14]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '원뿔과 구를 이해하고, 구성 요소와 성질을 탐구하여 설명할 수 있다.',
      explanation: '원뿔과 구의 구성 요소를 파악한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-15]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '직육면체와 정육면체의 겉넓이를 구하는 방법을 이해하고 이를 구할 수 있다.',
      explanation: '겉넓이의 공식을 이해하고 적용한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-16]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '직육면체와 정육면체의 부피를 구하는 방법을 이해하고 이를 구할 수 있다.',
      explanation: '부피의 공식을 이해하고 적용한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-17]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '1㎤와 1㎥의 단위를 알고, 부피를 재고 어림할 수 있다.',
      explanation: '부피의 단위를 이해하고 측정한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-18]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '원기둥의 겉넓이와 부피를 구하는 방법을 이해하고 이를 구할 수 있다.',
      explanation: '원기둥의 겉넓이와 부피를 구한다.',
      keyCompetencies: ['문제 해결', '추론'],
      areaName: '도형과 측정'
    },
    {
      code: '[6수02-19]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '여러 가지 입체도형의 공간적인 특징을 탐구하고 설명할 수 있다.',
      explanation: '다양한 입체도형의 공간 감각을 기른다.',
      keyCompetencies: ['추론', '창의·융합'],
      areaName: '도형과 측정'
    },
    // 변화와 관계 영역
    {
      code: '[6수03-04]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '비례식을 이해하고 비례식의 성질을 이용하여 간단한 비례식을 풀 수 있다.',
      explanation: '비례식의 성질을 이해하고 활용한다.',
      keyCompetencies: ['추론', '문제 해결'],
      areaName: '변화와 관계'
    },
    {
      code: '[6수03-05]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '비례배분을 이해하고 이를 실생활에 적용하여 문제를 해결할 수 있다.',
      explanation: '비례배분의 의미를 이해하고 문제를 해결한다.',
      keyCompetencies: ['문제 해결', '의사소통'],
      areaName: '변화와 관계'
    },
    // 자료와 가능성 영역
    {
      code: '[6수04-03]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '여러 가지 사건에 대하여 일어날 가능성을 수나 말로 표현할 수 있다.',
      explanation: '가능성의 의미를 이해하고 표현한다.',
      keyCompetencies: ['추론', '의사소통'],
      areaName: '자료와 가능성'
    },
    {
      code: '[6수04-04]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '간단한 경우의 수를 구할 수 있다.',
      explanation: '경우의 수의 개념을 이해하고 구한다.',
      keyCompetencies: ['추론', '문제 해결'],
      areaName: '자료와 가능성'
    },
    {
      code: '[6수04-05]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '자료를 수집, 분류, 정리하여 목적에 맞는 그래프로 나타내고 그래프를 해석할 수 있다.',
      explanation: '목적에 맞는 그래프를 선택하여 나타낸다.',
      keyCompetencies: ['정보 처리', '의사소통'],
      areaName: '자료와 가능성'
    },
    {
      code: '[6수04-06]',
      gradeGroup: '5-6',
      grade: 6,
      semester: 2,
      description: '띠그래프와 원그래프를 알고, 이를 해석하거나 나타낼 수 있다.',
      explanation: '띠그래프와 원그래프로 자료를 표현하고 해석한다.',
      keyCompetencies: ['정보 처리', '의사소통'],
      areaName: '자료와 가능성'
    }
  ]
}
