import { Router } from "express";
import { create, all, find, update } from "@controllers/problem.controller";

const router = Router();

router.post("/", create);
router.get("/", all);
router.get("/:param", find);
router.patch("/:id", update);

export default router;
