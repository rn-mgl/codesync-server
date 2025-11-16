import { create } from "@/controllers/user-controller";
import { Router } from "express";

const router = Router();

router.post("/", create);

export default router;
