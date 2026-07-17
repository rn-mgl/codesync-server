import type { BaseHintData } from "./hint.interface";
import type { BaseProblemData } from "./problem.interface";
import type { BaseTestCaseData } from "./test-case.interface";

export interface Paginate {
  page: number;
  limit: number;
}

export type RecordCount = { count: number };

export type VALID_TABLES =
  | "achievements"
  | "attempts"
  | "chat_messages"
  | "code_snapshots"
  | "cody"
  | "friendships"
  | "hints"
  | "problem_topics"
  | "problems"
  | "session_participants"
  | "sessions"
  | "study_group_members"
  | "study_groups"
  | "submissions"
  | "test_cases"
  | "topics"
  | "user_achievements"
  | "user_progress"
  | "users";

export type TableColumns<T extends VALID_TABLES> = T extends "problems"
  ? Partial<BaseProblemData>
  : T extends "test_cases"
    ? Partial<BaseTestCaseData>
    : T extends "hints"
      ? Partial<BaseHintData>
      : Record<string, unknown>;
