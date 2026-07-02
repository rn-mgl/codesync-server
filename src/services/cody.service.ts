import AppError from "@src/errors/app.error";
import type {
  BaseCodyData,
  Chat,
  CodyPayload,
} from "@src/interface/cody.interface";
import Cody from "@src/models/cody.model";
import { assignField } from "@src/utils/type.util";
import { StatusCodes } from "http-status-codes";

export async function getCodyByLookup(
  identifier: number | string,
  lookup: "id",
): Promise<BaseCodyData>;

export async function getCodyByLookup(
  identifier: number | string,
  lookup: "user",
): Promise<BaseCodyData>;

export async function getCodyByLookup(
  identifier: string,
  lookup: "interaction",
): Promise<BaseCodyData>;

export async function getCodyByLookup(
  identifier: string | number,
  lookup: string,
): Promise<BaseCodyData> {
  switch (lookup) {
    case "id":
      const id = Number(identifier);

      if (Number.isNaN(id)) {
        throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
      }

      const records = (await Cody.findById(id)) as BaseCodyData[];

      if (!records || !records[0]) {
        throw new AppError(
          `The session could not be found.`,
          StatusCodes.NOT_FOUND,
        );
      }

      return records[0];

    case "interaction":
      const interaction = identifier;

      if (typeof interaction !== "string") {
        throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
      }

      const interactions = (await Cody.findByInteraction(
        interaction,
      )) as BaseCodyData[];

      if (!interactions || !interactions[0]) {
        throw new AppError(
          `The session could not be found.`,
          StatusCodes.NOT_FOUND,
        );
      }

      return interactions[0];

    case "user":

    default:
      throw new AppError(`Invalid lookup type.`, StatusCodes.BAD_REQUEST);
  }
}

export async function getCodysByLookup(
  identifier: string | number,
  lookup: "user",
): Promise<BaseCodyData[]>;

export async function getCodysByLookup(
  identifier: string | number,
  lookup: string,
) {
  switch (lookup) {
    case "user":
      const user = Number(identifier);

      if (Number.isNaN(user)) {
        throw new AppError(`Invalid lookup.`, StatusCodes.BAD_REQUEST);
      }

      const chats = (await Cody.findByUser(user)) as BaseCodyData[];

      return chats;
  }
}

export function buildCreateCodyPayload(cody: CodyPayload) {
  const payload = {} as CodyPayload;

  const FIELDS: (keyof CodyPayload)[] = [
    "input",
    "interaction",
    "name",
    "output",
    "previous_interaction",
    "user_id",
  ];

  for (const field of FIELDS) {
    const value = cody[field];

    if (value !== undefined) {
      assignField(field, value, payload);
    }
  }

  return payload;
}

export function buildChatHistory(
  chats: BaseCodyData[],
  parentInteraction: string,
) {
  const relatedInteractions: string[] = [];

  getNextInteraction(parentInteraction, chats, relatedInteractions);

  const relatedChats = chats
    .filter((c) => relatedInteractions.includes(c.interaction))
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1));

  console.log(relatedChats);

  const interaction = relatedChats[relatedChats.length - 1]?.interaction ?? "";

  const preparedChats: Chat[] = [];

  for (const c of relatedChats) {
    const codyChat: Chat = {
      id: Math.random(),
      input: c.output,
      sender: "cody",
    };

    // don't push the system first chat
    if (c.previous_interaction !== null) {
      const userChat: Chat = {
        id: Math.random(),
        input: c.input,
        sender: "user",
      };

      preparedChats.push(userChat);
    }

    preparedChats.push(codyChat);
  }

  return { chats: preparedChats, interaction };
}

export function getNextInteraction(
  parent: string | null,
  interactions: BaseCodyData[],
  output: string[] = [],
) {
  if (parent === null) return;

  output.push(parent);

  const nextParent =
    interactions.find((i) => i.previous_interaction === parent)?.interaction ??
    null;

  parent = nextParent;

  getNextInteraction(parent, interactions, output);
}
