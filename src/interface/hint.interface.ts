export interface BaseHintData {
  problem_id: number;
  text: string;
  level: number;
}

export interface AdditionalHintData {
  order_index: number;
  deleted_at: string | null;
}

export type FullHintData = BaseHintData & AdditionalHintData;
