import mysql from "mysql2/promise";
import { env } from "@src/configs/env.config";

let db: null | mysql.Pool = null;

export const createConnection = (): mysql.Pool => {
  if (db === null) {
    db = mysql.createPool({
      host: env.DB_HOST ?? "",
      user: env.DB_USER ?? "",
      database: env.DB_NAME ?? "",
      password: env.DB_PASS ?? "",
      port: Number(env.DB_PORT),
    });
  }

  return db;
};
