import { Router } from "express";
import { all, create, find, update } from "@controllers/hintController.ts";

const router = Router();

router.get("/", all);
router.post("/", create);
router.get("/:param", find);
router.get("/:id", update);

export default router;
