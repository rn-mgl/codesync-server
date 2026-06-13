import { Router } from "express";
import { find } from "@controllers/user-achievement.controller";

const router = Router();
router.get("/:identifier", find);

export default router;
