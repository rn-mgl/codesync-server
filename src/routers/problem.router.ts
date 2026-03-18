import { Router } from "express";
import { create, all, find, update } from "@controllers/problem.controller";

const router = Router();

router.post("/", create);
router.get("/", all);
router.get("/:param", find);
router.patch("/:slug", update);

export default router;
