import Session from "@src/models/Session";
import { StatusCodes } from "http-status-codes";
import AppError from "@src/errors/AppError";
import { type Request, type Response } from "express";
import {
  isAdditionalSessionData,
  isBaseSessionData,
} from "@src/utils/typeUtil";
import type {
  AdditionalSessionData,
  BaseSessionData,
} from "@src/interface/sessionInterface";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseSessionData(body)) {
    throw new AppError(`Invalid session data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseSessionData & Partial<AdditionalSessionData> = {
    code: body.code,
    host_id: body.host_id,
    language: body.language,
    max_participants: body.max_participants,
    problem_id: body.problem_id,
    status: body.status,
    title: body.title,
    type: body.type,
  };

  if (isAdditionalSessionData(body, "partial")) {
    const FIELDS: (keyof AdditionalSessionData)[] = [
      "ended_at",
      "password",
      "started_at",
    ];

    for (const field of FIELDS) {
      if (field in body && body[field as keyof AdditionalSessionData]) {
        createData[field as keyof AdditionalSessionData] =
          body[field as keyof AdditionalSessionData];
      }
    }
  }
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

  let session: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      session = await Session.findById(id);

      return res.json({ session });

    case "code":
      const code = params.param;

      session = await Session.findByCode(code);

      return res.json({ session });

    case "status":
      const status = params.param;

      session = await Session.findByStatus(status);

      return res.json({ session });

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (typeof params !== "object" || params === null || !("id" in params)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isBaseSessionData(body) && !isAdditionalSessionData(body)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<BaseSessionData & AdditionalSessionData> = {};

  if (isBaseSessionData(body, "partial")) {
    const FIELDS: (keyof BaseSessionData)[] = [
      "code",
      "host_id",
      "language",
      "max_participants",
      "problem_id",
      "status",
      "title",
      "type",
    ];

    for (const field of FIELDS) {
      if (field in body && body[field as keyof object]) {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  if (isAdditionalSessionData(body, "partial")) {
    const FIELDS: (keyof AdditionalSessionData)[] = [
      "ended_at",
      "password",
      "started_at",
    ];

    for (const field of FIELDS) {
      if (field in body && body[field as keyof object]) {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await Session.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!updated });
};
