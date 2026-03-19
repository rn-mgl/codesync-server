export interface BaseFriendshipData {
  friend_id: number;
  user_id: number;
  status: FRIENDSHIP_STATUS;
}

export interface AdditionalFriendshipData {
  requested_at: string;
  accepted_at: string;
  deleted_at: string | null;
}

export interface FullFriendshipData
  extends BaseFriendshipData, AdditionalFriendshipData {
  id: number;
}

export type FRIENDSHIP_STATUS = "pending" | "accepted" | "declined" | "blocked";
