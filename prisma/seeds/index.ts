// 성취기준 시드 데이터 메인 인덱스
// 2022 개정 교육과정 기반 - 교육부 공식 문서 교차 검증

export { koreanStandards } from './korean-standards'
export { mathStandards } from './math-standards'
export { englishStandards } from './english-standards'
export { socialStandards } from './social-standards'
export { scienceStandards } from './science-standards'

export interface AchievementStandardData {
  code: string
  gradeGroup: string
  grade: number
  semester: number
  description: string
  explanation?: string
  keyCompetencies: string[]
  areaName: string // 영역명 (예: 듣기·말하기, 읽기, 쓰기)
}

export interface SubjectStandardsData {
  subjectCode: string
  subjectName: string
  standards: AchievementStandardData[]
}
