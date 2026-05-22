export interface BaseHintData {
  id: number;
  problem_id: number;
  hint: string;
  level: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdditionalHintData {
  order_index: number;
  deleted_at: string | null;
}

export type HintPayload = Pick<
  BaseHintData,
  "hint" | "level" | "order_index" | "problem_id"
>;

export type SoftDeleteHintPayload = Pick<BaseHintData, "deleted_at">;

export interface CreateHintPayload extends Omit<HintPayload, "problem_id"> {
  problem: string;
}

export interface UpdateHintPayload extends Partial<
  Omit<HintPayload, "problem_id">
> {
  problem?: string;
}

export type FullHintData = BaseHintData & AdditionalHintData;
