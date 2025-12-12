import type { FullProblemData } from "@src/interface/problem-interface";

class Problem implements FullProblemData {
  title: string;
  slug: string;
  description: string;
  input_format: string;
  output_format: string;
  constraints: string;
  editorial: string;
  acceptance_rate: number;
  total_submissions: number;
  created_at: string;
  updated_at: string;

  constructor(data: FullProblemData) {
    this.title = data.title;
    this.slug = data.slug;
    this.description = data.description;
    this.input_format = data.input_format;
    this.output_format = data.output_format;
    this.constraints = data.constraints;
    this.editorial = data.editorial;
    this.acceptance_rate = data.acceptance_rate;
    this.total_submissions = data.total_submissions;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(data: Record<string, string>) {
    try {
    } catch (error) {
      console.log(error);
    }
  }
}

export default Problem;
