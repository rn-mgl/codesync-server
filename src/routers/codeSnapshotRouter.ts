import e, { Router } from "express";
import { create, find } from "@controllers/codeSnapshotController.ts";

const router = Router();

router.post("/", create);
router.get("/:param", find);

export default router;
