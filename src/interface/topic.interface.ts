export interface BaseTopicData {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  deleted_at: string | null;
}

export type TopicPayload = Pick<
  BaseTopicData,
  "name" | "slug" | "description" | "icon"
>;
