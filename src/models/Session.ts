import type {
  AdditionalAttemptData,
  BaseAttemptData,
} from "@src/interface/attemptsInterface";
import type {
  AdditionalSessionData,
  BaseSessionData,
  FullSessionData,
} from "@src/interface/sessionInterface";

class Session implements FullSessionData {
  title: string;
  session_code: string;
  host_id: string;
  language: string;
  max_participants: number;
  password: string | null;
  problem_id: string;
  session_type: "practice" | "interview" | "competition" | "learning";
  status: "waiting" | "active" | "completed" | "cancelled";
  started_at: string | null;
  ended_at: string | null;

  constructor(data: FullSessionData) {
    this.title = data.title;
    this.session_code = data.session_code;
    this.host_id = data.host_id;
    this.language = data.language;
    this.max_participants = data.max_participants;
    this.password = data.password;
    this.problem_id = data.problem_id;
    this.session_type = data.session_type;
    this.status = data.status;
    this.started_at = data.started_at;
    this.ended_at = data.ended_at;
  }

  static async create(data: BaseSessionData & Partial<AdditionalSessionData>) {
    try {
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async all() {
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

  static async findByCode(code: string) {
    try {
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async findByStatus(status: string) {
    try {
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async update(
    id: number,
    updates: Partial<BaseAttemptData & AdditionalAttemptData>
  ) {
    try {
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default Session;
