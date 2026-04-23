export interface InputFormat {
  style: "function" | "class";
  version: number;
  name: string;
  params: { name: string; type: string }[];
}

export interface OutputFormat {
  version: number;
  type: string;
  comparison: Record<string, unknown>;
}

export interface BaseProblemData {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  input_format: InputFormat;
  output_format: OutputFormat;
  constraints: string;
  editorial: string;
  acceptance_rate: number;
  total_submissions: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type ProblemPayload = Omit<
  BaseProblemData,
  | "id"
  | "acceptance_rate"
  | "total_submissions"
  | "created_at"
  | "updated_at"
  | "deleted_at"
>;

export interface AdditionalProblemData {}
