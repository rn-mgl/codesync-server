export interface BaseStudyGroupData {
  name: string;
  slug: string;
  owner_id: number;
  invite_code: string;
}

export interface AdditionalStudyGroupData {
  description: string;
  is_public: boolean;
  deleted_at: string | null;
}

export interface FullStudyGroupData
  extends BaseStudyGroupData, AdditionalStudyGroupData {
  id: number;
}

export interface BaseStudyGroupMemberData {
  group_id: number;
  user_id: number;
  role: GROUP_MEMBER_ROLES;
}

export interface AdditionalStudyGroupMemberData {
  joined_at: string;
  deleted_at: string | null;
}

export interface FullStudyGroupMemberData
  extends BaseStudyGroupMemberData, AdditionalStudyGroupMemberData {
  id: number;
}

type GROUP_MEMBER_ROLES = "owner" | "moderator" | "member";
