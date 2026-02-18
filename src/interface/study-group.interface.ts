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

export interface BaseStudyGroupMemberData {
  group_id: number;
  user_id: number;
  role: GROUP_MEMBER_ROLES;
}

export interface AdditionalStudyGroupMemberData {
  joined_at: string;
}

export type FullStudyGroupMemberData = BaseStudyGroupMemberData &
  AdditionalStudyGroupMemberData;

type GROUP_MEMBER_ROLES = "owner" | "moderator" | "member";
