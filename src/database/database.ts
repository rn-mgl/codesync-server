import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST ?? "",
  user: process.env.DB_USER ?? "",
  database: process.env.DB_NAME ?? "",
  password: process.env.DB_PASS ?? "",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
});

export default db;
