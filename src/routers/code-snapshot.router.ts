import { create, find } from "@controllers/code-snapshot.controller";
import { Router } from "express";

const router = Router();

router.post("/", create);
router.get("/:identifier", find);

export default router;
