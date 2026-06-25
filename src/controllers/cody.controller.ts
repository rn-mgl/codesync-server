import { GoogleGenAI } from "@google/genai";
import { env } from "@src/configs/env.config";
import { type Request, type Response } from "express";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_KEY });

  const interact = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: body.message,
    previous_interaction_id: body.interaction ?? null,
  });

  return res.json({
    success: true,
    data: { output: interact.output_text, interaction: interact.id },
  });
};
