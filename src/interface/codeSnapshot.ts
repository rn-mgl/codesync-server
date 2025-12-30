export interface BaseCodeSnapshotData {}

export interface AdditionalCodeSnapshotData {}

export type FullCodeSnapshotData = BaseCodeSnapshotData &
  AdditionalCodeSnapshotData;
