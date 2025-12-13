import { Router } from "express";
import { create } from "@controllers/problem-controller.ts";

const router = Router();

router.post("/", create);

export default router;
