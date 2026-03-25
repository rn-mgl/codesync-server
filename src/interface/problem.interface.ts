export interface InputFormat {
  style: "function" | "class";
  version: number;
  name: string;
  params: { name: string; type: string }[];
}

export interface OutputFormat {
  version: number;
  type: string;
}

export interface BaseProblemData {
  title: string;
  slug: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface AdditionalProblemData {
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

export interface FullProblemData
  extends BaseProblemData, AdditionalProblemData {
  id: number;
}
