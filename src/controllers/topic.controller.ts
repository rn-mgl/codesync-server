import AppError from "@src/errors/app.error";
import { isValidTopicPayload } from "@src/guard/topic.guard";
import Topic from "@src/models/topic.model";
import { uploadFile } from "@src/services/cloudinary.service";
import {
  buildDeleteTopicPayload,
  buildTopicPayload,
  getTopicByLookup,
} from "@src/services/topic.service";
import {
  isValidIdentifierParam,
  isValidLookupQuery,
  isValidObject,
  isValidString,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const create = async (req: Request, res: Response) => {
  const body = req.body;
  const file = req.file;

  if (!isValidObject(body)) {
    throw new AppError(`Invalid topic data.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidObject(file)) {
    throw new AppError(`Invalid file upload.`, StatusCodes.BAD_REQUEST);
  }

  if (!file.path) {
    throw new AppError(
      `File could not be found in the server.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  const uploaded = await uploadFile(file.path);

  const payload = {
    name: body.name,
    description: body.description,
    slug: body.slug,
    icon: uploaded.secure_url,
  };

  if (!isValidTopicPayload(payload)) {
    throw new AppError(`Invalid topic data.`, StatusCodes.BAD_REQUEST);
  }

  const createData = buildTopicPayload(payload);

  console.log(createData);

  const created = await Topic.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred when creating the topic.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { message: `Topic created successfully.` } });
};

export const all = async (req: Request, res: Response) => {
  const topics = await Topic.all();

  return res.status(StatusCodes.OK).json({ success: true, data: { topics } });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  const topic = await getTopicByLookup(params.identifier, query.lookup);

  return res.status(StatusCodes.OK).json({ success: true, data: { topic } });
};

export const update = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;
  const file = req.file;
  const query = req.query;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid parameter.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidObject(body)) {
    throw new AppError(`Invalid request data.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid query data.`, StatusCodes.BAD_REQUEST);
  }

  if (!file && !isValidString(body.icon)) {
    throw new AppError(`Invalid request data.`, StatusCodes.BAD_REQUEST);
  }

  const payload = {
    name: body.name,
    description: body.description,
    slug: body.slug,
    icon: body.icon,
  };

  if (file && isValidString(file.path)) {
    const uploaded = await uploadFile(file.path);

    payload.icon = uploaded.secure_url;
  }

  if (!isValidTopicPayload(payload, "partial")) {
    throw new AppError(`Invalid request data.`, StatusCodes.BAD_REQUEST);
  }

  const updateData = buildTopicPayload(payload);

  const topic = await getTopicByLookup(params.identifier, query.lookup);

  const updated = await Topic.update(topic.id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { message: `Topic updated successfully.` } });
};

export const destroy = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid identifier.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  const topic = await getTopicByLookup(params.identifier, query.lookup);

  const payload = buildDeleteTopicPayload(topic.slug);

  const deleted = await Topic.destroy(topic.id, payload);

  if (!deleted) {
    throw new AppError(
      `An error occurred during deletion.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { message: "Topic deleted successfully." } });
};
