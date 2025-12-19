import { Router } from "express";
import { all, create, find, update } from "@controllers/topic-controller.ts";

const router = Router();

router.post("/", create);
router.get("/", all);
router.get("/:param", find);
router.patch("/:id", update);

export default router;
