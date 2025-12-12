import mysql from "mysql2/promise";

let db: null | mysql.Pool = null;

export const createConnection = () => {
  if (db === null) {
    db = mysql.createPool({
      host: process.env.DB_HOST ?? "",
      user: process.env.DB_USER ?? "",
      database: process.env.DB_NAME ?? "",
      password: process.env.DB_PASS ?? "",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    });
  }

  return db;
};
