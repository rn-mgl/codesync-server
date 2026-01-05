import Friendship from "@src/models/Friendship";
import { StatusCodes } from "http-status-codes";
import { type Request, type Response } from "express";
import {
  isAdditionalFriendshipData,
  isBaseFriendshipData,
  isValidLookupBody,
  isValidLookupParam,
  isValidUpdateParam,
} from "@src/utils/typeUtil";
import AppError from "@src/errors/AppError";
import type {
  AdditionalFriendshipData,
  BaseFriendshipData,
  FRIENDSHIP_STATUS,
  FullFriendshipData,
} from "@src/interface/friendshipsInterface";
import type { RowDataPacket } from "mysql2";

export const create = async (req: Request, res: Response) => {
  const body = req.body;

  if (!isBaseFriendshipData(body)) {
    throw new AppError(`Invalid friendship data.`, StatusCodes.BAD_REQUEST);
  }

  let createData: BaseFriendshipData = {
    friend_id: body.friend_id,
    status: body.status,
    user_id: body.user_id,
  };

  const created = await Friendship.create(createData);

  if (!created) {
    throw new AppError(
      `An error occurred during creation.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return res.json({ success: !!created });
};

export const find = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!isValidLookupBody(body) || !isValidLookupParam(params)) {
    throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }

  let friendship: RowDataPacket[] | null = null;

  switch (body.lookup) {
    case "id":
      const id = parseInt(params.param);

      friendship = await Friendship.findById(id);

      return res.json({ friendship });

    case "user":
      const user = parseInt(params.param);

      friendship = await Friendship.findByUser(user);

      return res.json({ friendship });

    case "status":
      const status = params.param;

      friendship = await Friendship.findByStatus(status);

      return res.json({ friendship });

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!isValidUpdateParam(params)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  if (
    !isBaseFriendshipData(body, "partial") &&
    !isAdditionalFriendshipData(body, "partial")
  ) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  let updateData: Partial<FullFriendshipData> = {};

  if (isBaseFriendshipData(body, "partial")) {
    const FIELDS: (keyof BaseFriendshipData)[] = ["status"];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  if (isAdditionalFriendshipData(body, "partial")) {
    const FIELDS: (keyof AdditionalFriendshipData)[] = ["accepted_at"];

    for (const field of FIELDS) {
      if (field in body && typeof body[field as keyof object] !== "undefined") {
        updateData[field as keyof object] = body[field as keyof object];
      }
    }
  }

  const id = parseInt(params.id);
  const updated = await Friendship.update(id, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.BAD_REQUEST
    );
  }

  return res.json({ success: !!updated });
};
