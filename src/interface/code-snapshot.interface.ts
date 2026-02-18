export interface BaseCodeSnapshotData {
  session_id: number;
  user_id: number;
  code_content: string;
  cursor_pointer: string;
  change_type: CHANGE_TYPES;
  line_number: number;
}

export interface AdditionalCodeSnapshotData {}

export type FullCodeSnapshotData = BaseCodeSnapshotData &
  AdditionalCodeSnapshotData;

type CHANGE_TYPES = "insert" | "delete" | "replace";
