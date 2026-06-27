import { Router } from "express";
import { create, update } from "@controllers/cody.controller";

const router = Router();

router.post("/", create);
router.patch("/:id", update);

export default router;
