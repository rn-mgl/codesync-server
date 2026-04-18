export interface UnlockCriteria {
  version: number;
  type: "metric_threshold" | "streak" | "composite" | "special";
  metric?: string;
  operator?: ">=" | "=" | "<=";
  value?: number;
  scope?: "lifetime" | "daily" | "weekly" | "current_streak";
  filters?: {
    difficulty?: ("easy" | "medium" | "hard" | "expert")[];
    topic_slugs?: string[];
    session_type?: ("practice" | "interview" | "competition" | "learning")[];
    role?: string[];
    hints_used_max?: number;
    language?: string[];
    is_public?: boolean;
  };
  conditions?: UnlockCriteria[];
  match?: "all" | "any";
  progress_label?: string;
}

export interface BaseAchievementData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  badge_color: BADGE_COLORS;
  category: ACHIEVEMENT_CATEGORIES;
  unlock_criteria: UnlockCriteria;
  points: number;
}

export interface AdditionalAchievementData {
  deleted_at: string | null;
}

export interface FullAchievementData
  extends BaseAchievementData, AdditionalAchievementData {
  id: number;
}

type BADGE_COLORS = "diamond" | "gold" | "silver" | "bronze";

type ACHIEVEMENT_CATEGORIES =
  | "problems"
  | "streak"
  | "social"
  | "skill"
  | "special";
