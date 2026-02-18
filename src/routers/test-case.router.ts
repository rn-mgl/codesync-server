import { Router } from "express";
import { all, create, find, update } from "@controllers/test-case.controller";

const router = Router();

router.get("/", all);
router.get("/:param", find);
router.post("/", create);
router.patch("/:id", update);

export default router;
