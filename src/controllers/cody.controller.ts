import { GoogleGenAI } from "@google/genai";
import { env } from "@src/configs/env.config";
import AppError from "@src/errors/app.error";
import {
  isValidCodyChatPayload,
  isValidCodyPayload,
} from "@src/guards/cody.guard";
import type { UserMiddleware } from "@src/interface/auth.interface";
import Cody from "@src/models/cody.model";
import {
  buildChatHistory,
  buildCreateCodyPayload,
  getCodyByLookup,
  getCodysByLookup,
} from "@src/services/cody.service";
import { isValidIdParam, isValidObject } from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";

export const create = async (req: Request, res: Response) => {
  const user = req.user as UserMiddleware;

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_KEY });

  // for SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });

  const message = `You are Cody. You are assisting the user with their inquiry as the global AI in the application called CodeSync. Greet the user ${user.name}`;

  const stream = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: message,
    stream: true,
  });

  let interaction: string = "";
  let output: string = "";

  for await (const event of stream) {
    if (event.event_type === "step.delta") {
      if (event.delta.type === "text") {
        // Correctly sends data over the line

        output += event.delta.text;

        const lines = event.delta.text.split("\n");

        for (const line of lines) {
          res.write(`event: message\n`);
          res.write(`data: ${line}\n`);
        }

        res.write(`\n`);
      }
    } else if (event.event_type === "interaction.completed") {
      interaction = event.interaction.id;

      res.write(`event: cody_completed\n`);
      res.write(`data: ${interaction}\n`);
      res.write(`\n`);
    }
  }

  const dateToday = DateTime.now().toFormat("yyyy-MM-dd hh:mm:ss");

  const data = {
    name: `Chat ${dateToday}`,
    interaction,
    user_id: user.id,
    input: message,
    output,
    previous_interaction: null,
  };

  if (!isValidCodyPayload(data)) {
    throw new AppError(`Invalid cody payload.`, StatusCodes.BAD_REQUEST);
  }

  const payload = buildCreateCodyPayload(data);

  const created = await Cody.create(payload);

  res.write(`event: stored\n`);
  res.write(`data: ${created.insertId}\n`);
  res.write(`\n`);

  if (!created) {
    throw new AppError(
      `An error occurred while initializing cody.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  // end transaction
  res.end();
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;
  const user = req.user as UserMiddleware;

  if (!isValidObject(body)) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid parameters.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidCodyChatPayload(body)) {
    throw new AppError(`Invalid payload.`, StatusCodes.BAD_REQUEST);
  }

  const cody = await getCodyByLookup(params.id, "id");

  if (cody.user_id !== user.id) {
    throw new AppError(
      `TYou are not allowed to access this session`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_KEY });

  // for SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });

  const stream = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: body.input,
    previous_interaction_id: body.interaction ?? null,
    stream: true,
  });

  let interaction: string = "";
  let output: string = "";

  for await (const event of stream) {
    if (event.event_type === "step.delta") {
      if (event.delta.type === "text") {
        // Correctly sends data over the line

        output += event.delta.text;

        const lines = event.delta.text.split("\n");

        for (const line of lines) {
          res.write(`event: message\n`);
          res.write(`data: ${line}\n`);
        }

        res.write(`\n`);
      }
    } else if (event.event_type === "interaction.completed") {
      interaction = event.interaction.id;

      res.write(`event: cody_completed\n`);
      res.write(`data: ${interaction}\n`);
      res.write(`\n`);
    }
  }

  const dateToday = DateTime.now().toFormat("yyyy-MM-dd hh:mm:ss");

  const data = {
    name: `Chat ${dateToday}`,
    interaction,
    user_id: user.id,
    input: body.input,
    output,
    previous_interaction: body.interaction,
  };

  if (!isValidCodyPayload(data)) {
    throw new AppError(`Invalid cody payload.`, StatusCodes.BAD_REQUEST);
  }

  const payload = buildCreateCodyPayload(data);

  const created = await Cody.create(payload);

  if (!created) {
    throw new AppError(
      `An error occurred while updating the session.`,
      StatusCodes.NOT_FOUND,
    );
  }

  // end transaction
  res.end();
};

export const all = async (req: Request, res: Response) => {
  const user = req?.user as UserMiddleware;

  if (!user || !user.id) {
    throw new AppError(
      `You are unauthorized to proceed.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  const chats = await Cody.findByUser(user.id, { parentOnly: true });

  return res.status(StatusCodes.OK).json({ success: true, data: { chats } });
};

export const find = async (req: Request, res: Response) => {
  const user = req?.user as UserMiddleware;
  const params = req.params;

  if (!user || !user.id) {
    throw new AppError(
      `You are unauthorized to proceed.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  if (!isValidIdParam(params)) {
    throw new AppError(`Invalid parameter.`, StatusCodes.BAD_REQUEST);
  }

  const chat = await getCodyByLookup(params.id, "id");

  if (chat.user_id !== user.id) {
    throw new AppError(
      `You are not allowed to view this session.`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  const userChats = await getCodysByLookup(chat.user_id, "user");

  const { chats, interaction } = buildChatHistory(userChats, chat.interaction);

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { chats, interaction } });
};
