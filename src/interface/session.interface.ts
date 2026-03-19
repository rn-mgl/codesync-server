export interface BaseSessionData {
  code: string;
  title: string;
  problem_id: string;
  host_id: string;
  type: SESSION_TYPES;
  status: STATUSES;
  language: string;
  max_participants: number;
}

export interface AdditionalSessionData {
  password: string | null;
  started_at: string | null;
  ended_at: string | null;
  deleted_at: string | null;
}

export interface FullSessionData
  extends BaseSessionData, AdditionalSessionData {
  id: number;
}

type SESSION_TYPES = "practice" | "interview" | "competition" | "learning";

type STATUSES = "waiting" | "active" | "completed" | "cancelled";

export interface BaseSessionParticipantData {
  session_id: number;
  user_id: number;
  role: PARTICIPANT_ROLES;
  joined_at: string;
}

export interface AdditionalSessionParticipantData {
  left_at: string | null;
  lines_added: number;
  lines_deleted: number;
  is_active: boolean;
  deleted_at: string | null;
}

export interface FullSessionParticipantData
  extends BaseSessionParticipantData, AdditionalSessionParticipantData {
  id: number;
}

type PARTICIPANT_ROLES = "host" | "collaborator" | "observer";
