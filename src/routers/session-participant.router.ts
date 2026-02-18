import { Router } from "express";
import {
  create,
  find,
  update,
} from "@controllers/session-participant.controller";

const router = Router();

router.post("/", create);
router.get("/:param", find);
router.patch("/:id", update);

export default router;
