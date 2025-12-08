import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import userRouter from "@routers/user-router.ts";

import errorMiddleware from "@middlewares/error-middleware.ts";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/user", userRouter);
app.use(errorMiddleware);

export default app;
