import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";

import achievementRouter from "@routers/achievement.router";
import attemptRouter from "@routers/attempt.router";
import authRouter from "@routers/auth.router";
import chatMessageRouter from "@routers/chat-message.router";
import codeSnapshotRouter from "@routers/code-snapshot.router";
import friendshipRouter from "@routers/friendship.router";
import hintRouter from "@routers/hint.router";
import problemRouter from "@routers/problem.router";
import sessionParticipantRouter from "@routers/session-participant.router";
import sessionRouter from "@routers/session.router";
import studyGroupMemberRouter from "@routers/study-group-member.router";
import studyGroupRouter from "@routers/study-group.router";
import submissionRouter from "@routers/submission.router";
import testCaseRouter from "@routers/test-case.router";
import topicRouter from "@routers/topic.router";
import userAchievementRouter from "@routers/user-achievement.router";
import userProgressRouter from "@routers/user-progress.router";
import userRouter from "@routers/user.router";

import errorMiddleware from "@middlewares/error.middleware";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { env } from "./configs/env.config";
import { authMiddleware } from "./middlewares/auth.middleware";

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_KEY,
  api_secret: env.CLOUDINARY_SECRET,
});

const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./tmp/uploads");
  },
  filename: (req, file, cb) => {
    const suffix = randomUUID();
    const extension = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}_${suffix}.${extension}`);
  },
});
const upload = multer({ storage });

app.set("trust proxy", true);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  return res.json({ success: true });
});
app.use("/auth", authRouter);
app.use("/user", [authMiddleware, upload.single("image")], userRouter);
app.use("/problem", authMiddleware, problemRouter);
app.use("/topic", [authMiddleware, upload.single("icon")], topicRouter);
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
app.use(
  "/achievement",
  [authMiddleware, upload.single("icon")],
  achievementRouter,
);
app.use("/user-achievement", authMiddleware, userAchievementRouter);

app.use(errorMiddleware);

export default app;
