import AppError from "@src/errors/app.error";
import type {
  AdditionalSubmissionData,
  BaseSubmissionData,
} from "@src/interface/submission.interface";
import Submission from "@src/models/submission.model";
import {
  assignField,
  isAdditionalSubmissionData,
  isBaseSubmissionData,
  isValidSubmissionType,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "fs";
import type { ServerResponse } from "@src/interface/server.interface";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!("submission" in body)) {
    throw new AppError(
      `Invalid Problem data. Missing values.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const { submission } = body;

  if (!isValidSubmissionType(submission)) {
    throw new AppError(`Invalid submission type.`, StatusCodes.BAD_REQUEST);
  }

  const type = submission.type;

  if (!isBaseSubmissionData(submission)) {
    throw new AppError(`Invalid submission data.`, StatusCodes.BAD_REQUEST);
  }

  fs.writeFileSync("./sandbox/javascript.js", submission.code);

  switch (type) {
    case "run":
      let createData: BaseSubmissionData & Partial<AdditionalSubmissionData> = {
        code: submission.code,
        language: submission.language,
        problem_id: submission.problem_id,
        status: submission.status,
        user_id: submission.user_id,
      };

      if (isAdditionalSubmissionData(submission, "partial")) {
        const FIELDS: (keyof AdditionalSubmissionData)[] = [
          "error_message",
          "execution_time_ms",
          "memory_used_kb",
          "test_results",
        ];

        for (const field of FIELDS) {
          const value = submission[field as keyof AdditionalSubmissionData];
          if (value !== undefined) {
            assignField(field, value, createData);
          }
        }
      }

      const created = await Submission.create(createData);

      if (!created) {
        throw new AppError(
          `An error occurred during submission.`,
          StatusCodes.BAD_REQUEST,
        );
      }

      return res
        .status(!!created ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: !!created });
    case "test":
      const command = `docker run --rm -v codesync_sandbox-data:/usr/src/app/sandbox --name javascript-sandbox javascript-sandbox-image node sandbox/javascript.js`;

      let data: ServerResponse | null = null;

      const execAsync = promisify(exec);

      try {
        const { stdout, stderr } = await execAsync(command, {
          timeout: 5000,
          env: { DOCKER_API_VERSION: "1.44" },
        });

        data = { success: true, data: stdout };
      } catch (error) {
        console.log(error);

        data = {
          success: false,
          message: "An error occurred during code execution.",
        };
      }

      return res
        .status(
          data.success ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR,
        )
        .json(data);

    default:
      throw new AppError(`Invalid submission type.`, StatusCodes.BAD_REQUEST);
  }
};

export const all = async (req: Request, res: Response) => {
  const submissions = await Submission.all();

  return res.json({ submissions });
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

  let submission: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      submission = await Submission.findById(id);

      return res.json({ submission });
    case "user":
      const userId = parseInt(params.param);

      submission = await Submission.findByUser(userId);

      return res.json({ submission });
    case "problem":
      const problemId = parseInt(params.param);

      submission = await Submission.findByProblem(problemId);

      return res.json({ submission });
    case "status":
      const status = params.param;

      submission = await Submission.findByStatus(status);

      return res.json({ submission });

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};
