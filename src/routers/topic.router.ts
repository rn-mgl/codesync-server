import { Router } from "express";
import {
  all,
  create,
  destroy,
  find,
  update,
} from "@controllers/topic.controller";

const router = Router();

router.post("/", create);
router.get("/", all);
router.get("/:identifier", find);
router.patch("/:identifier", update);
router.delete("/:identifier", destroy);

export default router;
