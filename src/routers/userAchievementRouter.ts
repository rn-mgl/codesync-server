import { Router } from "express";
import {
  create,
  destroy,
  find,
} from "@controllers/userAchievementController.ts";

const router = Router();
router.post("/", create);
router.get("/:param", find);
router.delete("/:id", destroy);

export default router;
