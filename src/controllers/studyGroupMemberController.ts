import AppError from "@src/errors/AppError";
import type { BaseStudyGroupMemberData } from "@src/interface/studyGroupInterface";
import StudyGroupMember from "@src/models/StudyGroupMember";
import {
  isBaseStudyGroupMemberData,
  isValidLookupBody,
  isValidLookupParam,
  isValidUpdateParam,
} from "@src/utils/typeUtil";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseStudyGroupMemberData(body)) {
    throw new AppError(`Invalid group member data.`, StatusCodes.BAD_REQUEST);
  }

  const createData: BaseStudyGroupMemberData = {
    group_id: body.group_id,
    role: body.role,
    user_id: body.user_id,
  };

  const created = await StudyGroupMember.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!created });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const body = req.body;

  if (!isValidLookupBody(body) || !isValidLookupParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let studyGroupMember: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      studyGroupMember = await StudyGroupMember.findById(id);

      return res.json({ study_group_member: studyGroupMember });

    case "group":
      const group = parseInt(params.param);

      studyGroupMember = await StudyGroupMember.findByGroup(group);

      return res.json({ study_group_member: studyGroupMember });

    case "user":
      const user = parseInt(params.param);

      studyGroupMember = await StudyGroupMember.findByUser(user);

      return res.json({ study_group_member: studyGroupMember });

    case "role":
      const role = params.param;

      studyGroupMember = await StudyGroupMember.findByRole(role);

      return res.json({ study_group_member: studyGroupMember });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!isValidUpdateParam(params)) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isBaseStudyGroupMemberData(body, "partial")) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<BaseStudyGroupMemberData> = {};

  if (isBaseStudyGroupMemberData(body, "partial")) {
    const FIELDS: (keyof BaseStudyGroupMemberData)[] = ["role"];

    for (const field of FIELDS) {
      if (field in body && body[field as keyof object]) {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await StudyGroupMember.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!updated });
};
