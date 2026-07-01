export interface BaseCodyData {
  id: number;
  name: string;
  user_id: number;
  previous_interaction: string | null;
  interaction: string;
  input: string;
  output: string;
  created_at: string;
  updated_at: string;
}

export type CodyPayload = Pick<
  BaseCodyData,
  | "name"
  | "interaction"
  | "user_id"
  | "previous_interaction"
  | "input"
  | "output"
>;

export type CodyChatPayload = Pick<BaseCodyData, "input" | "interaction">;
