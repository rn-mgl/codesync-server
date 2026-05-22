import { Router } from "express";
import {
  all,
  create,
  find,
  update,
  destroy,
} from "@controllers/hint.controller";

const router = Router();

router.get("/", all);
router.post("/", create);
router.get("/:id", find);
router.patch("/:id", update);
router.delete("/:id", destroy);

export default router;
