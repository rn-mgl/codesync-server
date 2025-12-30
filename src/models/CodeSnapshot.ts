import type {
  AdditionalCodeSnapshotData,
  BaseCodeSnapshotData,
  FullCodeSnapshotData,
} from "@src/interface/codeSnapshot";

class CodeSnapshot implements FullCodeSnapshotData {
  constructor(data: FullCodeSnapshotData) {}

  static async create(
    data: BaseCodeSnapshotData & Partial<AdditionalCodeSnapshotData>
  ) {
    try {
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findById(id: number) {
    try {
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(id: number, updates: Partial<FullCodeSnapshotData>) {
    try {
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default CodeSnapshot;
