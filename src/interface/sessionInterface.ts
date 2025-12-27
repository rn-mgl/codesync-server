export interface BaseSessionData {
  code: string;
  title: string;
  problem_id: string;
  host_id: string;
  type: keyof typeof SESSION_TYPES;
  status: keyof typeof STATUS;
  language: string;
  max_participants: number;
}

export interface AdditionalSessionData {
  password: string | null;
  started_at: string | null;
  ended_at: string | null;
}

export type FullSessionData = BaseSessionData & AdditionalSessionData;

const SESSION_TYPES = {
  practice: "practice",
  interview: "interview",
  competition: "competition",
  learning: "learning",
} as const;

const STATUS = {
  waiting: "waiting",
  active: "active",
  completed: "completed",
  cancelled: "cancelled",
} as const;
