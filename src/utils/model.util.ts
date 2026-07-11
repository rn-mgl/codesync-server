import { createConnection } from "@src/database/database";
import type { Paginate, VALID_TABLES } from "@src/interface/model.interface";
import type { RowDataPacket } from "mysql2";

export const computeOffset = (paginate: Paginate) => {
  const offset = paginate.page * paginate.limit;

  return offset;
};

export const addLimitOffset = (
  query: string,
  limit: number,
  offset: number,
) => {
  if (query.includes(";")) {
    query = query.replace(";", "");
  }

  return (query += ` LIMIT ${limit} OFFSET ${offset}`);
};

export const getRecordCount = async (table: VALID_TABLES) => {
  try {
    const db = createConnection();

    const query = `SELECT COUNT(*) AS count FROM ${table};`;

    const data = await db.execute<RowDataPacket[]>(query);

    if (!data[0]) {
      throw new Error(`Could not get record count.`);
    }

    const extracted = data[0][0];

    if (typeof extracted !== "object" || extracted === null) {
      throw new Error(`Could not parse record count.`);
    }

    if (!("count" in extracted) || typeof extracted.count !== "number") {
      throw new Error(`Could not parse record count.`);
    }

    return extracted;
  } catch (e) {
    throw new Error(`An error occurred when getting the record count.`);
  }
};
