export interface BaseProblemData {
  title: string;
  slug: string;
  description: string;
}

export interface AdditionalProblemData {
  input_format: string;
  output_format: string;
  constraints: string;
  editorial: string;
  acceptance_rate: number;
  total_submissions: number;
  created_at: string;
  updated_at: string;
}

export type FullProblemData = BaseProblemData & AdditionalProblemData;
