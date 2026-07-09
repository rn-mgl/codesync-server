export interface BaseChatMessageData {
  session_id: number;
  sender_id: number;
  message: string;
  message_type: MESSAGE_TYPES;
}

export interface FullChatMessageData extends BaseChatMessageData {
  id: number;
}

type MESSAGE_TYPES = "text" | "code" | "system";
