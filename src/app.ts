import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import userRouter from "@/routers/user-router";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/user", userRouter);

export default app;
