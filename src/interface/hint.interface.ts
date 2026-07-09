export interface BaseHintData {
  id: number;
  problem_id: number;
  hint: string;
  level: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface AdditionalHintData {
  order_index: number;
}

export type HintPayload = Pick<
  BaseHintData,
  "hint" | "level" | "order_index" | "problem_id"
>;

export interface CreateHintPayload extends Omit<HintPayload, "problem_id"> {
  problem: string;
}

export interface UpdateHintPayload extends Partial<
  Omit<HintPayload, "problem_id">
> {
  problem?: string;
}

export type FullHintData = BaseHintData & AdditionalHintData;
