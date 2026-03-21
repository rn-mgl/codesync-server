import { Router } from "express";
import {
  create,
  destroy,
  find,
} from "@controllers/user-achievement.controller";

const router = Router();
router.post("/", create);
router.get("/:identifier", find);
router.delete("/:id", destroy);

export default router;
