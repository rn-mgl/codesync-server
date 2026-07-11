import AppError from "@src/errors/app.error";
import {
  isValidCreateProblemPayload,
  isValidUpdateProblemPayload,
} from "@src/guards/problem.guard";
import type { RecordCount } from "@src/interface/model.interface";
import type { BaseProblemData } from "@src/interface/problem.interface";
import { redisClient } from "@src/libs/redis.lib";
import ProblemTopic from "@src/models/problem-topic.model";
import Problem from "@src/models/problem.model";
import { getHintsByLookup } from "@src/services/hint.service";
import { syncProblemTopic } from "@src/services/problem-topic.service";
import {
  buildProblemPayload,
  getProblemByLookup,
} from "@src/services/problem.service";
import { getTestCaseByLookup } from "@src/services/test-case.service";
import { getTopicsByLookup } from "@src/services/topic.service";
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
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  if (body.problem === undefined) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const problemPayload = body.problem;

  if (!isValidCreateProblemPayload(problemPayload)) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const createData = buildProblemPayload(problemPayload);

  const created = await Problem.create(createData);

  if (problemPayload.topics?.length) {
    const topics = problemPayload.topics;

    const payload = (await getTopicsByLookup(topics, "slugs")).map((topic) => ({
      problem_id: created.insertId,
      topic_id: topic.id,
    }));

    await ProblemTopic.create(payload);
  }

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.CREATED).json({
    success: true,
    data: { message: "Problem created." },
  });
};

export const all = async (req: Request, res: Response) => {
  const query = req.query;

  let page: number = 0;
  let limit: number = 10;

  if (isValidPaginateQuery(query)) {
    page = Number(query.page);
    limit = Number(query.limit);
  }

  const problems = await Problem.all({ page, limit });
  const total = (await getRecordCount("problems")) as RecordCount;
  const pages = Math.ceil(total.count / limit);

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { problems, pagination: { pages } },
  });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidIdentifierParam(params) || !isValidLookupQuery(query)) {
    throw new AppError(`Invalid parameter`, StatusCodes.BAD_REQUEST);
  }

  const client = await redisClient();

  const lookup = query.lookup;
  const param = params.identifier;

  const cache = await client.get(`problem:${param}`);

  let problem: BaseProblemData | null = cache
    ? (JSON.parse(cache) as BaseProblemData)
    : null;

  if (!problem) {
    problem = await getProblemByLookup(param, lookup);

    await client.set(`problem:${problem.slug}`, JSON.stringify(problem));
  }

  console.log(problem);

  const testCases = await getTestCaseByLookup(problem.id, "problem", {
    is_sample: true,
  });

  const topics = await getTopicsByLookup(problem.id, "problem");

  const hints = await getHintsByLookup(problem.id, "problem");

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { problem: problem, testCases, topics, hints },
  });
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!isValidObject(body)) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  if (body.problem === undefined) {
    throw new AppError(`Invalid request`, StatusCodes.BAD_REQUEST);
  }

  const problemPayload = body.problem;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid request`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidUpdateProblemPayload(problemPayload)) {
    throw new AppError(`Invalid problem data.`, StatusCodes.BAD_REQUEST);
  }

  const updateData = buildProblemPayload(problemPayload);

  const slug = params.identifier;

  const problem = await getProblemByLookup(slug, "slug");

  const updated = await Problem.update(problem.id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const refreshedProblem = await getProblemByLookup(problem.id, "id");

  await syncProblemTopic(problem.id, problemPayload.topics ?? []);

  const cache = await redisClient();

  await cache.set(`problem:${slug}`, JSON.stringify(refreshedProblem));

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { message: `Problem has been updated.` },
  });
};

export const destroy = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidLookupQuery(query)) {
    throw new AppError(`Invalid delete request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid delete request.`, StatusCodes.BAD_REQUEST);
  }

  const problem = await getProblemByLookup(params.identifier, query.lookup);

  const deleted = await Problem.destroy(problem.id);

  if (!deleted) {
    throw new AppError(
      `An error occurred during deletion.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { message: "Problem deleted successfully." },
  });
};
