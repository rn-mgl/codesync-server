import { Router } from "express";
import {
  create,
  all,
  find,
  update,
  destroy,
} from "@controllers/problem.controller";

const router = Router();

router.post("/", create);
router.get("/", all);
router.get("/:param", find);
router.patch("/:identifier", update);
router.delete("/:identifier", destroy);

export default router;
