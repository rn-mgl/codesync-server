export interface BaseStudyGroupData {
  name: string;
  owner_id: number;
  invite_code: string;
}

export interface AdditionalStudyGroupData {
  description: string;
  is_public: boolean;
}

export type FullStudyGroupData = BaseStudyGroupData & AdditionalStudyGroupData;
