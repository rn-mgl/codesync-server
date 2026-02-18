import { Router } from "express";
import { all, create, find, update } from "@controllers/hint.controller";

const router = Router();

router.get("/", all);
router.post("/", create);
router.get("/:param", find);
router.get("/:id", update);

export default router;
