import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRouter from "@routers/auth-router.ts";
import userRouter from "@routers/user-router.ts";
import problemRouter from "@routers/problem-router.ts";

import errorMiddleware from "@middlewares/error-middleware.ts";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/problem", problemRouter);
app.use(errorMiddleware);

export default app;
