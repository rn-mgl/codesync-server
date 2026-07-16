import { createConnection } from "@src/database/database";
import type {
  Paginate,
  TableColumns,
  VALID_TABLES,
} from "@src/interface/model.interface";
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

export const getRecordCount = async <T extends VALID_TABLES>(
  table: T,
  options?: TableColumns<T>,
) => {
  try {
    const db = createConnection();

    let query = `SELECT COUNT(*) AS count FROM ${table}`;

    const conditions = [];
    const values = [];

    if (options) {
      for (const [k, v] of Object.entries(options)) {
        conditions.push(`${k} = ?`);
        values.push(v);
      }

      const preparedCondtions = conditions.join(" AND ");
      query += ` WHERE ${preparedCondtions};`;
    }

    const data = await db.execute<RowDataPacket[]>(query, values);

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
    console.log(e);
    throw new Error(`An error occurred when getting the record count.`);
  }
};
