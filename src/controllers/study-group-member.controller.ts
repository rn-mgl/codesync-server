import AppError from "@src/errors/app.error";
import type {
  BaseStudyGroupMemberData,
  FullStudyGroupMemberData,
} from "@src/interface/study-group.interface";
import StudyGroupMember from "@src/models/study-group-member.model";
import {
  assignField,
  isBaseStudyGroupMemberData,
  isValidLookupQuery,
  isValidIdentifierParam,
} from "@src/utils/type.util";
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
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!created });
};

export const find = async (req: Request, res: Response) => {
  const params = req.params;
  const query = req.query;

  if (!isValidLookupQuery(query) || !isValidIdentifierParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let studyGroupMember: RowDataPacket[] | null = null;

  switch (query.lookup) {
    case "id":
      const id = parseInt(params.identifier);

      studyGroupMember = await StudyGroupMember.findById(id);

      return res.json({ study_group_member: studyGroupMember });

    case "group":
      const group = parseInt(params.identifier);

      studyGroupMember = await StudyGroupMember.findByGroup(group);

      return res.json({ study_group_member: studyGroupMember });

    case "user":
      const user = parseInt(params.identifier);

      studyGroupMember = await StudyGroupMember.findByUser(user);

      return res.json({ study_group_member: studyGroupMember });

    case "role":
      const role = params.identifier;

      studyGroupMember = await StudyGroupMember.findByRole(role);

      return res.json({ study_group_member: studyGroupMember });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!isValidIdentifierParam(params)) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isBaseStudyGroupMemberData(body, "partial")) {
    throw new AppError(`Invalid request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<BaseStudyGroupMemberData> = {};

  if (isBaseStudyGroupMemberData(body, "partial")) {
    const FIELDS: (keyof BaseStudyGroupMemberData)[] = ["role"];

    for (const field of FIELDS) {
      const value = body[field as keyof BaseStudyGroupMemberData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  const studyGroupMemberId = Number(params.identifier);

  if (Number.isNaN(studyGroupMemberId)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  const studyGroupMember = (await StudyGroupMember.findById(
    studyGroupMemberId,
  )) as FullStudyGroupMemberData[];

  if (!studyGroupMember || !studyGroupMember[0]) {
    throw new AppError(
      `The record you are trying to update does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const updated = await StudyGroupMember.update(studyGroupMemberId, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!updated });
};
