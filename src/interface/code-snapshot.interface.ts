export interface BaseCodeSnapshotData {
  session_id: number;
  user_id: number;
  code_content: string;
  cursor_pointer: string;
  change_type: CHANGE_TYPES;
  line_number: number;
}

export type FullCodeSnapshotData = BaseCodeSnapshotData;

type CHANGE_TYPES = "insert" | "delete" | "replace";
