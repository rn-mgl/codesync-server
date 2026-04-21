import { Router } from "express";
import {
  create,
  find,
  update,
  all,
  destroy,
} from "@controllers/achievement.controller";

const router = Router();

router.get("/", all);
router.post("/", create);
router.get("/:identifier", find);
router.patch("/:identifier", update);
router.delete("/:identifier", destroy);

export default router;
