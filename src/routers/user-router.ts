import { create } from "@controllers/user-controller.ts";
import { Router } from "express";

const router = Router();

router.post("/", create);

export default router;
