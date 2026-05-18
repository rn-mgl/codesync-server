import AppError from "@src/errors/app.error";
import type { HintPayload } from "@src/interface/hint.interface";
import { assignField, type ValidationType } from "@src/utils/type.util";
import { StatusCodes } from "http-status-codes";

export function buildHintPayload(data: HintPayload, type?: "full"): HintPayload;

export function buildHintPayload(
  data: Partial<HintPayload>,
  type?: "partial",
): Partial<HintPayload>;

export function buildHintPayload(
  data: HintPayload | Partial<HintPayload>,
  type: ValidationType = "full",
) {
  const payload: typeof type extends "full"
    ? HintPayload
    : Partial<HintPayload> = {};

  const FIELDS: (keyof HintPayload)[] = [
    "level",
    "order_index",
    "problem_id",
    "hint",
  ];

  for (const field of FIELDS) {
    const value = data[field];

    if (value !== undefined) {
      assignField(field, value, payload);
    } else if (value === undefined && type === "full") {
      throw new AppError(`All values are required.`, StatusCodes.BAD_REQUEST);
    }
  }

  return payload;
}
