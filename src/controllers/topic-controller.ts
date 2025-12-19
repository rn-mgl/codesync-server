import AppError from "@src/errors/AppError";
import type {
  AdditionalTopicData,
  BaseTopicData,
} from "@src/interface/topic-interface";
import Topic from "@src/models/Topic";
import { isAdditionalTopicData, isBaseTopicData } from "@src/utils/type-utils";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!body || !isBaseTopicData(body)) {
    throw new AppError(`Invalid topic data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseTopicData & Partial<AdditionalTopicData> = {
    name: body.name,
    description: body.description,
    slug: body.slug,
  };

  if (isAdditionalTopicData(body, "partial")) {
    const FIELDS: (keyof AdditionalTopicData)[] = ["icon"];

    for (const field of FIELDS) {
      if (
        body[field as keyof object] &&
        typeof body[field as keyof object] === "string"
      ) {
        createData[field as keyof object] === body[field as keyof object];
      }
    }
  }

  const created = await Topic.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred when creating the topic.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!created });
};

export const all = async (req: Request, res: Response) => {
  const topics = await Topic.all();

  return res.json({ topics });
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

  const lookup = body.lookup;
  let topic: RowDataPacket[] | null = null;

  switch (lookup) {
    case "id":
      const id = parseInt(params.param);
      topic = await Topic.findById(id);

      return res.json({ topic });

    case "slug":
      const slug = params.param;
      topic = await Topic.findBySlug(slug);

      return res.json({ topic });

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (typeof params !== "object" || params === null || !("id" in params)) {
    throw new AppError(`Invalid parameter.`, StatusCodes.BAD_REQUEST);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    (!isBaseTopicData(body, "partial") &&
      !isAdditionalTopicData(body, "partial"))
  ) {
    throw new AppError(`Invalid topic data.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<BaseTopicData & AdditionalTopicData> = {};

  if (isBaseTopicData(body, "partial")) {
    const FIELDS: (keyof BaseTopicData)[] = ["name", "slug", "description"];

    for (const field of FIELDS) {
      if (body[field as keyof object] && typeof body[field as keyof object]) {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  if (isAdditionalTopicData(body, "partial")) {
    const FIELDS: (keyof AdditionalTopicData)[] = ["icon"];

    for (const field of FIELDS) {
      if (body[field as keyof object] && typeof body[field as keyof object]) {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const id = parseInt(params.id);

  const updated = await Topic.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.BAD_REQUEST
    );
  }

  return res.json({ success: !!updated });
};
