import AppError from "@src/errors/app.error";
import type {
  AdditionalStudyGroupData,
  BaseStudyGroupData,
  FullStudyGroupData,
} from "@src/interface/study-group.interface";
import StudyGroup from "@src/models/study-group.model";
import {
  assignField,
  isAdditionalStudyGroupData,
  isBaseStudyGroupData,
  isValidLookupQuery,
  isValidIdentifierParam,
  isValidUpdateParam,
} from "@src/utils/type.util";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseStudyGroupData(body)) {
    throw new AppError(`Invalid study group data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseStudyGroupData & Partial<AdditionalStudyGroupData> = {
    invite_code: body.invite_code,
    name: body.name,
    owner_id: body.owner_id,
    slug: body.slug,
  };

  if (isAdditionalStudyGroupData(body, "partial")) {
    const FIELDS: (keyof AdditionalStudyGroupData)[] = [
      "description",
      "is_public",
    ];

    for (const field of FIELDS) {
      const value = body[field as keyof AdditionalStudyGroupData];
      if (value !== undefined) {
        assignField(field, value, createData);
      }
    }
  }

  const created = await StudyGroup.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!created });
};

export const find = async (req: Request, res: Response) => {
  const query = req.query;
  const params = req.params;

  if (!isValidLookupQuery(query) || !isValidIdentifierParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let studyGroup: RowDataPacket[] | null = null;

  switch (query.lookup) {
    case "id":
      const id = parseInt(params.identifier);

      studyGroup = await StudyGroup.findById(id);

      return res.json({ study_group: studyGroup });

    case "owner":
      const owner = parseInt(params.identifier);

      studyGroup = await StudyGroup.findByOwner(owner);

      return res.json({ study_group: studyGroup });

    case "code":
      const code = params.identifier;

      studyGroup = await StudyGroup.findByCode(code);

      return res.json({ study_group: studyGroup });
    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!isValidLookupQuery(body)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (!isValidUpdateParam(params)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (
    !isBaseStudyGroupData(body, "partial") &&
    !isAdditionalStudyGroupData(body, "partial")
  ) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<FullStudyGroupData> = {};

  if (isBaseStudyGroupData(body, "partial")) {
    const FIELDS: (keyof BaseStudyGroupData)[] = [
      "invite_code",
      "name",
      "owner_id",
    ];

    for (const field of FIELDS) {
      const value = body[field as keyof BaseStudyGroupData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  if (isAdditionalStudyGroupData(body, "partial")) {
    const FIELDS: (keyof AdditionalStudyGroupData)[] = [
      "description",
      "is_public",
    ];

    for (const field of FIELDS) {
      const value = body[field as keyof AdditionalStudyGroupData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  let studyGroupId: number;

  if (body.lookup === "slug") {
    const studyGroup = (await StudyGroup.findBySlug(
      params.identifier,
    )) as FullStudyGroupData[];

    if (!studyGroup || !studyGroup[0]) {
      throw new AppError(
        `The study group you are trying to update does not exist.`,
        StatusCodes.NOT_FOUND,
      );
    }

    studyGroupId = studyGroup[0].id;
  } else {
    studyGroupId = Number(params.identifier);

    if (Number.isNaN(studyGroupId)) {
      throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
    }
  }

  const updated = await StudyGroup.update(studyGroupId, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return res.json({ success: !!updated });
};
