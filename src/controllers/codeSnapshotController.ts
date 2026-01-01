import AppError from "@src/errors/AppError";
import type {
  AdditionalCodeSnapshotData,
  BaseCodeSnapshotData,
} from "@src/interface/codeSnapshot";
import CodeSnapshot from "@src/models/CodeSnapshot";
import {
  isAdditionalCodeSnapshotData,
  isBaseCodeSnapshotData,
} from "@src/utils/typeUtil";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseCodeSnapshotData(body)) {
    throw new AppError(`Invalid code snapshot data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseCodeSnapshotData = {
    change_type: body.change_type,
    code_content: body.code_content,
    cursor_pointer: body.cursor_pointer,
    line_number: body.line_number,
    session_id: body.session_id,
    user_id: body.user_id,
  };

  if (isAdditionalCodeSnapshotData(body, "partial")) {
    const FIELDS: (keyof AdditionalCodeSnapshotData)[] = [];

    for (const field of FIELDS) {
      if (field in body && body[field as keyof object]) {
        createData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const created = await CodeSnapshot.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!created });
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

  let codeSnapshot: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      codeSnapshot = await CodeSnapshot.findById(id);

      return res.json({ code_snapshot: codeSnapshot });

    case "session":
      const session = parseInt(params.param);

      codeSnapshot = await CodeSnapshot.findBySession(session);

      return res.json({ code_snapshot: codeSnapshot });

    case "user":
      const user = parseInt(params.param);

      codeSnapshot = await CodeSnapshot.findByUser(user);

      return res.json({ code_snapshot: codeSnapshot });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};
