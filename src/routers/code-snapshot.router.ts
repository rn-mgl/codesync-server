import e, { Router } from "express";
import { create, find } from "@controllers/code-snapshot.controller";

const router = Router();

router.post("/", create);
router.get("/:param", find);

export default router;
