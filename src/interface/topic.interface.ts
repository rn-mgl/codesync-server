export interface BaseTopicData {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export type TopicPayload = Pick<
  BaseTopicData,
  "name" | "slug" | "description" | "icon"
>;
