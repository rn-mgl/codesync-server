import { GoogleGenAI } from "@google/genai";
import { env } from "@src/configs/env.config";
import { type Request, type Response } from "express";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

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

  for await (const event of stream) {
    if (event.event_type === "step.delta") {
      if (event.delta.type === "text") {
        // Correctly sends data over the line
        res.write(`data: ${event.delta.text}\n\n`);
      }
    }
  }

  // end transaction
  res.end();
};
