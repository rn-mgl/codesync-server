import Friendship from "@src/models/friendship.model";
import { StatusCodes } from "http-status-codes";
import { type Request, type Response } from "express";
import {
  assignField,
  isAdditionalFriendshipData,
  isBaseFriendshipData,
  isValidLookupQuery,
  isValidIdentifierParam,
} from "@src/utils/type.util";
import AppError from "@src/errors/app.error";
import type {
  AdditionalFriendshipData,
  BaseFriendshipData,
  FRIENDSHIP_STATUS,
  FullFriendshipData,
} from "@src/interface/friendship.interface";
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

  let friendship: RowDataPacket[] | null = null;

  switch (query.lookup) {
    case "id":
      const id = parseInt(params.identifier);

      friendship = await Friendship.findById(id);

      return res.json({ friendship });

    case "user":
      const user = parseInt(params.identifier);

      friendship = await Friendship.findByUser(user);

      return res.json({ friendship });

    case "status":
      const status = params.identifier;

      friendship = await Friendship.findByStatus(status);

      return res.json({ friendship });

    default:
      throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
  }
};

export const update = async (req: Request, res: Response) => {
  const body = req.body;
  const params = req.params;

  if (!isValidIdentifierParam(params)) {
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
      const value = body[field as keyof BaseFriendshipData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  if (isAdditionalFriendshipData(body, "partial")) {
    const FIELDS: (keyof AdditionalFriendshipData)[] = ["accepted_at"];

    for (const field of FIELDS) {
      const value = body[field as keyof AdditionalFriendshipData];
      if (value !== undefined) {
        assignField(field, value, updateData);
      }
    }
  }

  const friendshipId = Number(params.identifier);

  if (Number.isNaN(friendshipId)) {
    throw new AppError(`Invalid update request.`, StatusCodes.BAD_REQUEST);
  }

  const friendship = (await Friendship.findById(
    friendshipId,
  )) as FullFriendshipData[];

  if (!friendship || !friendship[0]) {
    throw new AppError(
      `The record you are trying to update does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const updated = await Friendship.update(friendshipId, updateData);

  if (!updated) {
    throw new AppError(
      `An error occurred during update.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  return res.json({ success: !!updated });
};
