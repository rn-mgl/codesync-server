import { createConnection } from "@src/database/database";

const db = createConnection();

export const executeQuery = async <T>(
  query: string,
  params?: Array<unknown>,
): Promise<T> => {
  const [result] = await db.execute(query, params);

  return result as T;
};
