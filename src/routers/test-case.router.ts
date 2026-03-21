import { Router } from "express";
import {
  all,
  create,
  find,
  update,
  destroy,
} from "@controllers/test-case.controller";

const router = Router();

router.get("/", all);
router.get("/:identifier", find);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", destroy);

export default router;
