import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRouter from "@routers/auth.router";
import userRouter from "@routers/user.router";
import problemRouter from "@routers/problem.router";
import topicRouter from "@routers/topic.router";
import testCaseRouter from "@routers/test-case.router";
import hintRouter from "@routers/hint.router";
import submissionRouter from "@routers/submission.router";
import attemptRouter from "@routers/attempt.router";
import sessionRouter from "@routers/session.router";
import sessionParticipantRouter from "@routers/session-participant.router";
import codeSnapshotRouter from "@routers/code-snapshot.router";
import chatMessageRouter from "@routers/chat-message.router";
import userProgressRouter from "@routers/user-progress.router";
import friendshipRouter from "@routers/friendship.router";
import studyGroupRouter from "@routers/study-group.router";
import studyGroupMemberRouter from "@routers/study-group-member.router";
import achievementRouter from "@routers/achievement.router";
import userAchievementRouter from "@routers/user-achievement.router";

import errorMiddleware from "@middlewares/error.middleware";
import { authMiddleware } from "./middlewares/auth.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/problem", authMiddleware, problemRouter);
app.use("/topic", authMiddleware, topicRouter);
app.use("/test-case", authMiddleware, testCaseRouter);
app.use("/hint", authMiddleware, hintRouter);
app.use("/submission", authMiddleware, submissionRouter);
app.use("/attempt", authMiddleware, attemptRouter);
app.use("/session", authMiddleware, sessionRouter);
app.use("/session-participant", authMiddleware, sessionParticipantRouter);
app.use("/code-snapshot", authMiddleware, codeSnapshotRouter);
app.use("/chat-message", authMiddleware, chatMessageRouter);
app.use("/user-progress", authMiddleware, userProgressRouter);
app.use("/friendship", authMiddleware, friendshipRouter);
app.use("/study-group", authMiddleware, studyGroupRouter);
app.use("/study-group-member", authMiddleware, studyGroupMemberRouter);
app.use("/achievement", authMiddleware, achievementRouter);
app.use("/user-achievement", authMiddleware, userAchievementRouter);

app.use(errorMiddleware);

export default app;
