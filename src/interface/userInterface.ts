export interface BaseUserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AdditionalUserData {
  problems_solved: number;
  total_submissions: number;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
}

export type FullUserData = BaseUserData & AdditionalUserData;

export interface BaseUserProgressData {
  user_id: number;
  progress_data: string;
}

export interface AdditionalUserProgressData {
  problems_solved_today: number;
  time_spent_seconds: number;
  submissions_made: number;
  streak_days: number;
}

export type FullUserProgressData = BaseUserProgressData &
  AdditionalUserProgressData;

export interface BaseUserAchievementData {
  user_id: number;
  achievement_id: number;
}

export interface AdditionalUserAchievementData {
  earned_at: string;
}

export type FullUserAchievementData = BaseUserAchievementData &
  AdditionalUserAchievementData;
