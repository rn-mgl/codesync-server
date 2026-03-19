export interface BaseTopicData {
  name: string;
  slug: string;
  description: string;
}

export interface AdditionalTopicData {
  icon: string;
  deleted_at: string | null;
}

export type FullTopicData = BaseTopicData & AdditionalTopicData;
