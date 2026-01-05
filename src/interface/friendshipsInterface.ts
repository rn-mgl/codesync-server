export interface BaseFriendshipData {
  friend_id: number;
  user_id: number;
  status: FRIENDSHIP_STATUS;
}

export interface AdditionalFriendshipData {
  requested_at: string;
  accepted_at: string;
}

export type FullFriendshipData = BaseFriendshipData & AdditionalFriendshipData;

export type FRIENDSHIP_STATUS = "pending" | "accepted" | "declined" | "blocked";
