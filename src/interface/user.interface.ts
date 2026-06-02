export interface BaseUserData {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  problems_solved: number;
  total_submissions: number;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  deleted_at: string | null;
}

export type UserPayload = Omit<
  BaseUserData,
  "id" | "created_at" | "updated_at"
>;

export type CreateUserPayload = Pick<
  UserPayload,
  "first_name" | "last_name" | "username" | "email" | "password"
>;

export type UpdateUserPayload = Partial<
  Pick<
    UserPayload,
    | "first_name"
    | "last_name"
    | "username"
    | "password"
    | "problems_solved"
    | "is_verified"
    | "total_submissions"
    | "deleted_at"
  >
>;

export interface BaseUserProgressData {
  user_id: number;
  progress_data: string;
}

export interface AdditionalUserProgressData {
  problems_solved_today: number;
  time_spent_seconds: number;
  submissions_made: number;
  streak_days: number;
  deleted_at: string | null;
}

export interface FullUserProgressData
  extends BaseUserProgressData, AdditionalUserProgressData {
  id: number;
}

export interface BaseUserAchievementData {
  user_id: number;
  achievement_id: number;
}

export interface AdditionalUserAchievementData {
  earned_at: string;
  deleted_at: string | null;
}

export interface FullUserAchievementData
  extends BaseUserAchievementData, AdditionalUserAchievementData {
  id: number;
}
