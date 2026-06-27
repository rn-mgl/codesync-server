import { GoogleGenAI } from "@google/genai";
import { env } from "@src/configs/env.config";
import AppError from "@src/errors/app.error";
import type { UserMiddleware } from "@src/interface/auth.interface";
import type { BaseCodyData } from "@src/interface/cody.interface";
import Cody from "@src/models/cody.model";
import { isValidIdParam, isValidObject } from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const create = async (req: Request, res: Response) => {
  const user = req.user as UserMiddleware;

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_KEY });

  // for SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });

  const stream = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: `You are cody. You are assisting the user with their inquiry as the quick-trigger AI in the application called CodeSync. Welcome the user ${user.username}`,
    stream: true,
  });

  let interaction: string = "";

  for await (const event of stream) {
    if (event.event_type === "step.delta") {
      if (event.delta.type === "text") {
        // Correctly sends data over the line

        const lines = event.delta.text.split("\n");

        for (const line of lines) {
          res.write(`data: ${line}\n`);
        }

        res.write(`\n`);
      }
    } else if (event.event_type === "interaction.completed") {
      interaction = event.interaction.id;

      const lines = `cody_completed=${event.interaction.id}`.split("\n");

      for (const line of lines) {
        res.write(`data: ${line}\n`);
      }

      res.write(`\n`);
    }
  }

  const created = await Cody.create({ interaction, user_id: user.id });

  const lines = `stored=${created.insertId}`.split("\n");

  for (const line of lines) {
    res.write(`data: ${line}\n`);
  }

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

  const id = Number(params.id);

  if (Number.isNaN(id)) {
    throw new AppError(`Invalid parameters.`, StatusCodes.BAD_REQUEST);
  }

  const codyRecords = (await Cody.findById(id)) as BaseCodyData[];

  if (!codyRecords || !codyRecords[0]) {
    throw new AppError(
      `The session could not be found.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const cody = codyRecords[0];

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
    input: body.message,
    previous_interaction_id: body.interaction ?? null,
    stream: true,
  });

  let interaction: string = "";

  for await (const event of stream) {
    if (event.event_type === "step.delta") {
      if (event.delta.type === "text") {
        // Correctly sends data over the line

        const lines = event.delta.text.split("\n");

        for (const line of lines) {
          res.write(`data: ${line}\n`);
        }

        res.write(`\n`);
      }
    } else if (event.event_type === "interaction.completed") {
      interaction = event.interaction.id;

      const lines = `cody_completed=${event.interaction.id}`.split("\n");

      for (const line of lines) {
        res.write(`data: ${line}\n`);
      }

      res.write(`\n`);
    }
  }

  const updated = await Cody.update(cody.id, { interaction });

  if (!updated) {
    throw new AppError(
      `An error occurred while updating the session.`,
      StatusCodes.NOT_FOUND,
    );
  }

  // end transaction
  res.end();
};
