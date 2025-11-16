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
}

export type FullUserData = BaseUserData & AdditionalUserData;
