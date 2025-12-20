import AppError from "@src/errors/AppError";
import type {
  AdditionalProblemData,
  BaseProblemData,
} from "@src/interface/problemInterface";
import Problem from "@src/models/Problem";
import {
  isAdditionalProblemData,
  isBaseProblemData,
} from "@src/utils/typeUtil";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!body || !isBaseProblemData(body)) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST
    );
  }

  const { title, slug, description } = body;

  let createData: BaseProblemData & Partial<AdditionalProblemData> = {
    title,
    slug,
    description,
  };

  if (isAdditionalProblemData(body, "partial")) {
    const FIELDS: (keyof AdditionalProblemData)[] = [
      "constraints",
      "editorial",
      "input_format",
      "output_format",
    ];

    for (const field of FIELDS) {
      if (
        field in body &&
        body[field as keyof object] &&
        typeof body[field as keyof object] === "string"
      ) {
        createData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const created = await Problem.create(createData);

  return res.json({ success: !!created });
};

export const all = async (req: Request, res: Response) => {
  const problems = await Problem.all();

  return res.json({ problems });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (typeof params !== "object" || params === null || !("param" in params)) {
    throw new AppError(`Invalid parameter`, StatusCodes.BAD_REQUEST);
  }

  if (typeof body !== "object" || body === null || !("lookup" in body)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  const lookup = body.lookup;
  const param = params.param;
  let problem: null | RowDataPacket[] = null;

  switch (lookup) {
    case "id":
      const id = parseInt(param);

      problem = await Problem.findById(id);

      return res.json({ problem });
    case "slug":
      problem = await Problem.findBySlug(param);

      return res.json({ problem });
    default:
      throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (typeof params !== "object" || params === null || !("id" in params)) {
    throw new AppError(`Invalid request`, StatusCodes.BAD_REQUEST);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    (!isBaseProblemData(body, "partial") &&
      !isAdditionalProblemData(body, "partial"))
  ) {
    throw new AppError(`Invalid problem data.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<BaseProblemData & AdditionalProblemData> = {};

  if (isBaseProblemData(body, "partial")) {
    const FIELDS: (keyof BaseProblemData)[] = ["slug", "title", "description"];

    for (const field of FIELDS) {
      if (
        field in body &&
        body[field as keyof object] &&
        typeof body[field as keyof object] === "string"
      ) {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  if (isAdditionalProblemData(body, "partial")) {
    const FIELDS: (keyof AdditionalProblemData)[] = [
      "constraints",
      "editorial",
      "input_format",
      "output_format",
    ];

    for (const field of FIELDS) {
      if (
        field in body &&
        body[field as keyof object] &&
        typeof body[field as keyof object] === "string"
      ) {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await Problem.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!updated });
};
