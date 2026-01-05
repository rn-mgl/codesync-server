import Hint from "@src/models/Hint";
import { StatusCodes } from "http-status-codes";
import { type Request, type Response } from "express";
import { isAdditionalHintData, isBaseHintData } from "@src/utils/typeUtil";
import AppError from "@src/errors/AppError";
import type {
  AdditionalHintData,
  BaseHintData,
  FullHintData,
} from "@src/interface/hintInterface";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseHintData(body)) {
    throw new AppError(`Invalid hint data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseHintData & Partial<AdditionalHintData> = {
    hint_level: body.hint_level,
    hint_text: body.hint_text,
    problem_id: body.problem_id,
  };

  if (isAdditionalHintData(body, "partial")) {
    const FIELDS: (keyof AdditionalHintData)[] = ["order_index"];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        createData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const created = await Hint.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during hint creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!created });
};

export const all = async (req: Request, res: Response) => {
  const hints = await Hint.all();

  return res.json({ hints });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (typeof params !== "object" || params === null || !("param" in params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  if (typeof body !== "object" || body === null || !("lookup" in body)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let hint: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      hint = await Hint.findById(id);

      return res.json({ hint });
    case "problem":
      const problem = parseInt(params.param);

      hint = await Hint.findByProblem(problem);

      return res.json({ hint });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (typeof params !== "object" || params === null || !("id" in params)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isBaseHintData(body) && !isAdditionalHintData(body)) {
    throw new AppError(`Invalid update data.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<BaseHintData & AdditionalHintData> = {};

  if (isBaseHintData(body, "partial")) {
    const FIELDS: (keyof BaseHintData)[] = [
      "hint_level",
      "hint_text",
      "problem_id",
    ];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  if (isAdditionalHintData(body, "partial")) {
    const FIELDS: (keyof AdditionalHintData)[] = ["order_index"];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await Hint.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!updated });
};
