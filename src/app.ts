import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRouter from "@routers/authRouter.ts";
import userRouter from "@routers/userRouter.ts";
import problemRouter from "@routers/problemRouter.ts";
import topicRouter from "@routers/topicRouter.ts";
import testCaseRouter from "@routers/testCaseRouter.ts";
import hintRouter from "@routers/hintRouter.ts";
import submissionRouter from "@routers/submissionRouter.ts";
import attemptRouter from "@routers/attemptRouter.ts";
import sessionRouter from "@routers/sessionRouter.ts";
import sessionParticipantRouter from "@routers/sessionParticipantRouter.ts";
import codeSnapshotRouter from "@routers/codeSnapshotRouter.ts";
import chatMessageRouter from "@routers/chatMessageRouter.ts";
import progressRouter from "@routers/progressRouter.ts";
import friendshipRouter from "@routers/friendshipRouter.ts";

import errorMiddleware from "@middlewares/errorMiddleware.ts";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/problem", problemRouter);
app.use("/topic", topicRouter);
app.use("/test-case", testCaseRouter);
app.use("/hint", hintRouter);
app.use("/submission", submissionRouter);
app.use("/attempt", attemptRouter);
app.use("/session", sessionRouter);
app.use("/session-participant", sessionParticipantRouter);
app.use("/code-snapshot", codeSnapshotRouter);
app.use("/chat-message", chatMessageRouter);
app.use("/progress", progressRouter);
app.use("/friendship", friendshipRouter);

app.use(errorMiddleware);

export default app;
