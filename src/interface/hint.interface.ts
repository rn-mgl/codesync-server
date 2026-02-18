export interface BaseHintData {
  problem_id: number;
  hint_text: string;
  hint_level: number;
}

export interface AdditionalHintData {
  order_index: number;
}

export type FullHintData = BaseHintData & AdditionalHintData;
