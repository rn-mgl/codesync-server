export interface BaseTopicData {
  name: string;
  slug: string;
  description: string;
}

export interface AdditionalTopicData {
  icon: string;
}

export type FullTopicData = BaseTopicData & AdditionalTopicData;
