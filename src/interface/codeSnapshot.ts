export interface BaseCodeSnapshotData {
  session_id: number;
  user_id: number;
  code_content: string;
  cursor_pointer: string;
  change_type: keyof typeof CHANGE_TYPES;
  line_number: number;
}

export interface AdditionalCodeSnapshotData {}

export type FullCodeSnapshotData = BaseCodeSnapshotData &
  AdditionalCodeSnapshotData;

const CHANGE_TYPES = {
  insert: "insert",
  delete: "delete",
  replace: "replace",
} as const;
