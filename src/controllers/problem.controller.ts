import AppError from "@src/errors/app.error";
import {
  isValidCreateProblemPayload,
  isValidProblemPayload,
  isValidUpdateProblemPayload,
} from "@src/guard/problem.guard";
import type {
  BaseProblemTopicData,
  SoftDeleteProblemTopicPayload,
  UpdateProblemTopicPayload,
} from "@src/interface/problem-topic.interface";
import type { BaseTestCaseData } from "@src/interface/test-case.interface";
import type { BaseTopicData } from "@src/interface/topic.interface";
import ProblemTopic from "@src/models/problem-topic.model";
import Problem from "@src/models/problem.model";
import TestCase from "@src/models/test-case.model";
import Topic from "@src/models/topic.model";
import {
  buildDeleteProblemPayload,
  buildProblemPayload,
  getProblemByLookup,
} from "@src/services/problem.service";
import { getTopicsByLookup } from "@src/services/topic.service";
import {
  isValidIdentifierParam,
  isValidLookupQuery,
  isValidObject,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";

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
  const problems = await Problem.all();

  return res.status(StatusCodes.OK).json({ success: true, data: { problems } });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidIdentifierParam(params) || !isValidLookupQuery(query)) {
    throw new AppError(`Invalid parameter`, StatusCodes.BAD_REQUEST);
  }

  const lookup = query.lookup;
  const param = params.identifier;

  const problem = await getProblemByLookup(param, lookup);

  const testCases = (await TestCase.findByProblem(problem.id, {
    is_sample: true,
  })) as BaseTestCaseData[];

  return res.status(StatusCodes.OK).json({
    success: true,
    data: { problem: problem, testCases },
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

  const updateData = buildProblemPayload(problemPayload, "partial");

  const slug = params.identifier;

  const problem = await getProblemByLookup(slug, "slug");

  const updated = await Problem.update(problem.id, updateData);

  const problemTopics = (await ProblemTopic.findByProblem(
    problem.id,
  )) as BaseProblemTopicData[];

  // pivot problem-topic, keyed by {topic_id : primary_key}
  const pivotTopics = Object.fromEntries(
    problemTopics.map((pt) => [
      pt.topic_id,
      { id: pt.id, deleted_at: pt.deleted_at },
    ]),
  );

  const topicsBySlug = problemPayload.topics?.length
    ? ((await Topic.findBySlugs(problemPayload.topics)) as BaseTopicData[])
    : [];

  // selected topics, ids only
  const selectedTopics = topicsBySlug.map((topic) => topic.id);

  // check if each pivot topics is not in selected
  const topicsToDelete = Object.entries(pivotTopics)
    .filter(
      ([topic, data]) =>
        !selectedTopics.includes(Number(topic)) && data.deleted_at === null,
    )
    .map(([topic, data]) => data.id);

  const deletePayload: SoftDeleteProblemTopicPayload = {
    deleted_at: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
  };

  if (topicsToDelete.length) {
    await ProblemTopic.destroy(topicsToDelete, deletePayload);
  }

  // check if each pivot topics is in selected but is deleted in db
  const topicsToRecover = Object.entries(pivotTopics)
    .filter(
      ([topic, data]) =>
        selectedTopics.includes(Number(topic)) && data.deleted_at !== null,
    )
    .map(([topic, data]) => data.id);

  const recoverPayload: UpdateProblemTopicPayload = {
    deleted_at: null,
  };

  if (topicsToRecover.length) {
    await ProblemTopic.update(topicsToRecover, recoverPayload); //logic to undelete pivot rows using topicsToRecover;
  }

  // check if each selected topic is not yet in pivot
  const topicsToAdd = selectedTopics
    .filter((topic) => !pivotTopics[String(topic)])
    .map((topic) => ({ problem_id: problem.id, topic_id: topic }));

  if (topicsToAdd.length) {
    await ProblemTopic.create(topicsToAdd);
  }

  if (!updated) {
    throw new AppError(
      `An error occurred when the update was being performed.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

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

  const updateData = buildDeleteProblemPayload(problem.slug);

  const deleted = await Problem.destroy(problem.id, updateData);

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
