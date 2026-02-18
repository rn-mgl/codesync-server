import ChatMessages from "@src/models/chat-message.model";
import { StatusCodes } from "http-status-codes";
import { type Request, type Response } from "express";
import {
  isAdditionalChatMessageData,
  isBaseChatMessageData,
  isValidLookupBody,
  isValidLookupParam,
  isValidUpdateParam,
} from "@src/utils/type.util";
import AppError from "@src/errors/app.error";
import type {
  AdditionalChatMessageData,
  BaseChatMessageData,
  FullChatMessageData,
} from "@src/interface/chat-message.interface";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseChatMessageData(body)) {
    throw new AppError(`Invalid chat message data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseChatMessageData = {
    message: body.message,
    message_type: body.message_type,
    sender_id: body.sender_id,
    session_id: body.session_id,
  };

  if (isAdditionalChatMessageData(body, "partial")) {
    const FIELDS: (keyof AdditionalChatMessageData)[] = ["deleted_at"];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        createData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const created = await ChatMessages.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!created });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (!isValidLookupParam(params)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidLookupBody(body)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  let chatMessage: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      chatMessage = await ChatMessages.findById(id);

      return res.json({ chat_message: chatMessage });

    case "session":
      const session = parseInt(params.param);

      chatMessage = await ChatMessages.findBySession(session);

      return res.json({ chat_message: chatMessage });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (!isValidUpdateParam(params)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (
    !isBaseChatMessageData(body, "partial") &&
    !isAdditionalChatMessageData(body, "partial")
  ) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<FullChatMessageData> = {};

  if (isBaseChatMessageData(body, "partial")) {
    const FIELDS: (keyof BaseChatMessageData)[] = [
      "message",
      "message_type",
      "sender_id",
      "session_id",
    ];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  if (isAdditionalChatMessageData(body, "partial")) {
    const FIELDS: (keyof AdditionalChatMessageData)[] = ["deleted_at"];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await ChatMessages.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!updated });
};
