import AppError from "@src/errors/app.error";
import type {
  AdditionalSessionParticipantData,
  BaseSessionParticipantData,
  FullSessionParticipantData,
} from "@src/interface/session.interface";
import SessionParticipant from "@src/models/session-participant.model";
import {
  assignField,
  isAdditionalAttemptData,
  isAdditionalSessionParticipantData,
  isBaseSessionParticipantData,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseSessionParticipantData(body)) {
    throw new AppError(`Invalid session participant.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseSessionParticipantData &
    Partial<AdditionalSessionParticipantData> = {
    joined_at: body.joined_at,
    role: body.role,
    session_id: body.session_id,
    user_id: body.user_id,
  };

  if (isAdditionalSessionParticipantData(body, "partial")) {
    const FIELDS: (keyof AdditionalSessionParticipantData)[] = [
      "is_active",
      "left_at",
      "lines_added",
      "lines_deleted",
    ];

    for (const field of FIELDS) {
      const value = body[field as keyof AdditionalSessionParticipantData];
      if (value !== undefined) {
        assignField(field, value, createData);
      }
    }
  }

  const created = await SessionParticipant.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.BAD_REQUEST,
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

  let sessionParticipants: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      sessionParticipants = await SessionParticipant.findById(id);

      return res.json({ session_participants: sessionParticipants });

    case "session":
      const session = parseInt(params.param);

      sessionParticipants = await SessionParticipant.findBySession(session);

      return res.json({ session_participants: sessionParticipants });

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

  if (
    !isBaseSessionParticipantData(body, "partial") &&
    !isAdditionalSessionParticipantData(body, "partial")
  ) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<FullSessionParticipantData> = {};

  if (isBaseSessionParticipantData(body, "partial")) {
    const FIELDS: (keyof BaseSessionParticipantData)[] = ["role"];

    for (const field of FIELDS) {
      const value = body[field as keyof BaseSessionParticipantData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  if (isAdditionalSessionParticipantData(body, "partial")) {
    const FIELDS: (keyof AdditionalSessionParticipantData)[] = [
      "lines_added",
      "lines_deleted",
      "left_at",
      "is_active",
    ];

    for (const field of FIELDS) {
      const value = body[field as keyof AdditionalSessionParticipantData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  const id = parseInt(params.id);

  const updated = await SessionParticipant.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  return res.json({ success: !!updated });
};
