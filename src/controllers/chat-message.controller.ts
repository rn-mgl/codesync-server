import AppError from "@src/errors/app.error";
import type {
  BaseChatMessageData,
  FullChatMessageData,
} from "@src/interface/chat-message.interface";
import ChatMessages from "@src/models/chat-message.model";
import {
  assignField,
  isBaseChatMessageData,
  isValidIdentifierParam,
  isValidLookupQuery,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseChatMessageData(body)) {
    throw new AppError(`Invalid chat message data.`, StatusCodes.BAD_REQUEST);
  }

  const createData: BaseChatMessageData = {
    message: body.message,
    message_type: body.message_type,
    sender_id: body.sender_id,
    session_id: body.session_id,
  };

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
  const query = req.query;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup`, StatusCodes.BAD_REQUEST);
  }

  let chatMessage: FullChatMessageData[] | null = null;

  switch (query.lookup) {
    case "id":
      const id = parseInt(params.identifier);

      chatMessage = (await ChatMessages.findById(id)) as FullChatMessageData[];

      return res.json({ chat_message: chatMessage });

    case "session":
      const session = parseInt(params.identifier);

      chatMessage = (await ChatMessages.findBySession(
        session,
      )) as FullChatMessageData[];

      return res.json({ chat_message: chatMessage });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isBaseChatMessageData(body, "partial")) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  const updateData: Partial<FullChatMessageData> = {};

  if (isBaseChatMessageData(body, "partial")) {
    const FIELDS: (keyof BaseChatMessageData)[] = [
      "message",
      "message_type",
      "sender_id",
      "session_id",
    ];

    for (const field of FIELDS) {
      const value = body[field];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  const chatId = Number(params.identifier);

  if (Number.isNaN(chatId)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  const chat = (await ChatMessages.findById(chatId)) as FullChatMessageData[];

  if (!chat || !chat[0]) {
    throw new AppError(
      `The chat you are trying to update does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const updated = await ChatMessages.update(chatId, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!updated });
};
