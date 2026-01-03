export interface BaseProgressData {
  user_id: number;
  progress_data: string;
}

export interface AdditionalProgressData {
  problems_solved_today: number;
  time_spent_seconds: number;
  submissions_made: number;
  streak_days: number;
}

export type FullProgressData = BaseProgressData & AdditionalProgressData;
