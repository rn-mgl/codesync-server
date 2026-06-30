export interface BaseCodyData {
  id: number;
  name: string;
  user_id: number;
  interaction: string;
  created_at: string;
  updated_at: string;
}

export type CreateCodyPayload = Pick<
  BaseCodyData,
  "name" | "interaction" | "user_id"
>;

export type UpdateCodyPayload = Pick<BaseCodyData, "interaction">;
