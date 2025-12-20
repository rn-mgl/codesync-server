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
