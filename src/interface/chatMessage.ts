export interface BaseChatMessageData {
  session_id: number;
  sender_id: number;
  message: string;
  message_type: MESSAGE_TYPES;
}

export interface AdditionalChatMessageData {
  deleted_at: string | null;
}

export type FullChatMessageData = BaseChatMessageData &
  AdditionalChatMessageData;

type MESSAGE_TYPES = "text" | "code" | "system";
