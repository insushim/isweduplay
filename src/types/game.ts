export type GameType =
  | 'QUIZ_BATTLE'
  | 'SPEED_RACE'
  | 'SURVIVAL'
  | 'TEAM_BATTLE'
  | 'TOWER_DEFENSE'
  | 'MEMORY_MATCH'
  | 'WORD_HUNT'
  | 'BINGO'
  | 'ESCAPE_ROOM'
  | 'PUZZLE_QUEST'
  | 'MATH_RUNNER'
  | 'WORD_CHAIN'
  | 'JEOPARDY'
  | 'WHEEL_FORTUNE'
  | 'FLASH_CARDS'
  | 'MATCHING_PAIRS'
  | 'FILL_THE_BLANKS'
  | 'TIME_ATTACK'

export type GameMode = 'CLASSIC' | 'TIMED' | 'SUDDEN_DEATH' | 'TEAM_VS_TEAM' | 'COOPERATIVE' | 'PRACTICE'

export type GameStatus =
  | 'WAITING'
  | 'COUNTDOWN'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'SHOWING_RESULTS'
  | 'FINISHED'

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'FILL_IN_BLANK'
  | 'MATCHING'
  | 'ORDERING'

export interface Question {
  id: string
  type: QuestionType
  content: string
  options?: string[]
  answer: string
  explanation?: string
  hint?: string
  imageUrl?: string
  audioUrl?: string
  timeLimit: number
  points: number
  difficulty: number
}

export interface GamePlayer {
  id: string
  oderId?: string
  nickname: string
  avatarUrl?: string
  score: number
  streak: number
  maxStreak: number
  correctCount: number
  wrongCount: number
  coins: number
  powerUps: PowerUps
  teamId?: string
  rank?: number
  isHost: boolean
  isConnected: boolean
  isEliminated: boolean
}

export interface PowerUps {
  doublePoints: number
  extraTime: number
  fiftyFifty: number
  shield: number
  freeze: number
}

export interface GameSession {
  id: string
  hostId: string
  quizSetId?: string
  gameType: GameType
  gameMode: GameMode
  roomCode: string
  status: GameStatus
  settings: GameSettings
  maxPlayers: number
  currentRound: number
  totalRounds: number
  startedAt?: string
  endedAt?: string
}

export interface GameSettings {
  timeLimit: number
  pointMultiplier: number
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  showLeaderboard: boolean
  allowReconnect: boolean
  maxLives?: number // for survival mode
  teamCount?: number // for team battle
}

export interface GameResult {
  playerId: string
  playerName: string
  finalRank: number
  totalScore: number
  correctCount: number
  incorrectCount: number
  avgResponseTime: number
  maxStreak: number
  pointsEarned: number
  expEarned: number
}

export interface AnswerResult {
  playerId: string
  questionId: string
  answer: string
  isCorrect: boolean
  responseTime: number
  pointsEarned: number
  bonusPoints: number
  newScore: number
  newStreak: number
}

export interface LeaderboardEntry {
  playerId: string
  playerName: string
  avatarUrl?: string
  score: number
  rank: number
  streak: number
  correctCount: number
}

// Socket Events
export interface ServerToClientEvents {
  'room:joined': (data: { session: GameSession; player: GamePlayer; players: GamePlayer[] }) => void
  'player:joined': (data: { player: GamePlayer }) => void
  'player:left': (data: { playerId: string }) => void
  'player:disconnected': (data: { playerId: string }) => void
  'player:reconnected': (data: { playerId: string }) => void
  'game:countdown': (data: { seconds: number }) => void
  'game:started': () => void
  'game:paused': () => void
  'game:resumed': () => void
  'question:new': (data: { question: Question; index: number; total: number; timeLimit: number }) => void
  'question:timeUpdate': (data: { remaining: number }) => void
  'question:ended': (data: { correctAnswer: string; explanation?: string; stats: QuestionStats }) => void
  'answer:result': (data: AnswerResult) => void
  'player:scored': (data: { playerId: string; points: number; streak: number; newScore: number }) => void
  'leaderboard:update': (data: { players: LeaderboardEntry[] }) => void
  'game:finished': (data: { results: GameResult[]; rankings: LeaderboardEntry[] }) => void
  'powerup:activated': (data: { type: string; playerId: string }) => void
  'error': (data: { message: string }) => void
}

export interface ClientToServerEvents {
  'room:join': (data: { roomCode: string; playerName: string; avatar?: string }) => void
  'room:leave': (data: {}) => void
  'game:start': (data: {}) => void
  'game:pause': (data: {}) => void
  'game:resume': (data: {}) => void
  'answer:submit': (data: { questionId: string; answer: string; responseTime: number }) => void
  'powerup:use': (data: { type: string }) => void
  'chat:message': (data: { message: string }) => void
}

export interface QuestionStats {
  totalAnswers: number
  correctCount: number
  answerDistribution: Record<string, number>
  avgResponseTime: number
}

// Game Mode Configs
export const GAME_MODE_CONFIG: Record<GameType, {
  name: string
  description: string
  icon: string
  color: string
  minPlayers: number
  maxPlayers: number
  defaultSettings: Partial<GameSettings>
}> = {
  QUIZ_BATTLE: {
    name: '퀴즈 배틀',
    description: '빠르게 문제를 풀고 점수를 획득하세요!',
    icon: '⚔️',
    color: 'from-red-500 to-orange-500',
    minPlayers: 1,
    maxPlayers: 50,
    defaultSettings: { timeLimit: 30, showLeaderboard: true },
  },
  SPEED_RACE: {
    name: '스피드 레이스',
    description: '가장 빨리 결승선에 도달하세요!',
    icon: '🚀',
    color: 'from-blue-500 to-cyan-500',
    minPlayers: 2,
    maxPlayers: 30,
    defaultSettings: { timeLimit: 20 },
  },
  SURVIVAL: {
    name: '서바이벌',
    description: '틀리면 탈락! 마지막까지 살아남으세요',
    icon: '💀',
    color: 'from-purple-500 to-pink-500',
    minPlayers: 2,
    maxPlayers: 50,
    defaultSettings: { maxLives: 3 },
  },
  TEAM_BATTLE: {
    name: '팀 대전',
    description: '팀원들과 협력하여 상대팀을 이기세요!',
    icon: '👥',
    color: 'from-green-500 to-teal-500',
    minPlayers: 4,
    maxPlayers: 40,
    defaultSettings: { teamCount: 2 },
  },
  TOWER_DEFENSE: {
    name: '타워 디펜스',
    description: '문제를 맞춰 적을 물리치세요!',
    icon: '🏰',
    color: 'from-amber-500 to-yellow-500',
    minPlayers: 1,
    maxPlayers: 1,
    defaultSettings: { timeLimit: 15 },
  },
  MEMORY_MATCH: {
    name: '기억력 게임',
    description: '문제와 답을 짝지어 맞추세요!',
    icon: '🧠',
    color: 'from-pink-500 to-rose-500',
    minPlayers: 1,
    maxPlayers: 8,
    defaultSettings: {},
  },
  WORD_HUNT: {
    name: '단어 찾기',
    description: '숨겨진 단어를 찾아보세요!',
    icon: '🔍',
    color: 'from-indigo-500 to-violet-500',
    minPlayers: 1,
    maxPlayers: 20,
    defaultSettings: { timeLimit: 60 },
  },
  BINGO: {
    name: '빙고',
    description: '5줄 빙고를 먼저 완성하세요!',
    icon: '🎯',
    color: 'from-cyan-500 to-blue-500',
    minPlayers: 2,
    maxPlayers: 30,
    defaultSettings: {},
  },
  ESCAPE_ROOM: {
    name: '방탈출',
    description: '퍼즐을 풀고 방을 탈출하세요!',
    icon: '🚪',
    color: 'from-gray-600 to-gray-800',
    minPlayers: 1,
    maxPlayers: 4,
    defaultSettings: { timeLimit: 600 },
  },
  PUZZLE_QUEST: {
    name: '퍼즐 퀘스트',
    description: '퍼즐을 완성하며 모험을 떠나세요!',
    icon: '🧩',
    color: 'from-emerald-500 to-green-500',
    minPlayers: 1,
    maxPlayers: 1,
    defaultSettings: {},
  },
  MATH_RUNNER: {
    name: '수학 러너',
    description: '수학 문제를 풀며 달려나가세요!',
    icon: '🏃',
    color: 'from-orange-500 to-red-500',
    minPlayers: 1,
    maxPlayers: 20,
    defaultSettings: { timeLimit: 10 },
  },
  WORD_CHAIN: {
    name: '끝말잇기',
    description: '단어를 이어 말하세요!',
    icon: '🔗',
    color: 'from-lime-500 to-green-500',
    minPlayers: 2,
    maxPlayers: 10,
    defaultSettings: { timeLimit: 10 },
  },
  JEOPARDY: {
    name: '제퍼디',
    description: '카테고리별 문제를 선택하세요!',
    icon: '📺',
    color: 'from-blue-600 to-indigo-600',
    minPlayers: 2,
    maxPlayers: 6,
    defaultSettings: {},
  },
  WHEEL_FORTUNE: {
    name: '행운의 바퀴',
    description: '바퀴를 돌려 운명을 결정하세요!',
    icon: '🎡',
    color: 'from-purple-500 to-indigo-500',
    minPlayers: 2,
    maxPlayers: 8,
    defaultSettings: {},
  },
  FLASH_CARDS: {
    name: '플래시 카드',
    description: '카드를 넘기며 암기하세요!',
    icon: '📇',
    color: 'from-teal-500 to-cyan-500',
    minPlayers: 1,
    maxPlayers: 1,
    defaultSettings: {},
  },
  MATCHING_PAIRS: {
    name: '짝 맞추기',
    description: '같은 짝을 찾아 맞추세요!',
    icon: '🎴',
    color: 'from-rose-500 to-pink-500',
    minPlayers: 1,
    maxPlayers: 4,
    defaultSettings: {},
  },
  FILL_THE_BLANKS: {
    name: '빈칸 채우기',
    description: '빈칸에 알맞은 답을 채우세요!',
    icon: '✏️',
    color: 'from-slate-500 to-gray-600',
    minPlayers: 1,
    maxPlayers: 30,
    defaultSettings: { timeLimit: 45 },
  },
  TIME_ATTACK: {
    name: '타임 어택',
    description: '제한 시간 내에 최대한 많이 풀어보세요!',
    icon: '⏱️',
    color: 'from-red-600 to-orange-600',
    minPlayers: 1,
    maxPlayers: 50,
    defaultSettings: { timeLimit: 120 },
  },
}
