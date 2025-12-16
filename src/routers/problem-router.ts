import { Router } from "express";
import { create, all, find } from "@controllers/problem-controller.ts";

const router = Router();

router.post("/", create);
router.get("/", all);
router.get("/:param", find);

export default router;
