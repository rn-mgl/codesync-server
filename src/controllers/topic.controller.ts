import AppError from "@src/errors/app.error";
import { isValidTopicPayload } from "@src/guards/topic.guard";
import type { RecordCount } from "@src/interface/model.interface";
import Topic from "@src/models/topic.model";
import {
  buildTopicPayload,
  getTopicByLookup,
} from "@src/services/topic.service";
import { getRecordCount } from "@src/utils/model.util";
import {
  isValidIdentifierParam,
  isValidLookupQuery,
  isValidObject,
  isValidPaginateQuery,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isValidObject(body)) {
    throw new AppError(`Invalid topic data.`, StatusCodes.BAD_REQUEST);
  }

  if (!("topic" in body)) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  const topic = body.topic;

  if (!isValidTopicPayload(topic)) {
    throw new AppError(`Invalid topic data.`, StatusCodes.BAD_REQUEST);
  }

  const createData = buildTopicPayload(topic);

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
  const query = req.query;

  let page = 0;
  let limit = 10;

  if (isValidPaginateQuery(query)) {
    page = Number(query.page);
    limit = Number(query.limit);
  }

  const topics = await Topic.all({ page, limit });
  const total = (await getRecordCount("topics")) as RecordCount;
  const pages = Math.ceil(total.count / limit);

  return res
    .status(StatusCodes.OK)
    .json({ success: true, data: { topics, pagination: { pages } } });
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

  if (!("topic" in body)) {
    throw new AppError(`Invalid request data.`, StatusCodes.BAD_REQUEST);
  }

  const topicPayload = body.topic;

  if (!isValidTopicPayload(topicPayload, "partial")) {
    throw new AppError(`Invalid request data.`, StatusCodes.BAD_REQUEST);
  }

  const updateData = buildTopicPayload(topicPayload);

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

  const deleted = await Topic.destroy(topic.id);

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
