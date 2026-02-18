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
app.use("/user-progress", userProgressRouter);
app.use("/friendship", friendshipRouter);
app.use("/study-group", studyGroupRouter);
app.use("/study-group-member", studyGroupMemberRouter);
app.use("/achievement", achievementRouter);
app.use("/user-achievement", userAchievementRouter);

app.use(errorMiddleware);

export default app;
