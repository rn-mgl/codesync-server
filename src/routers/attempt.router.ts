import { Router } from "express";
import { all, create, find } from "@controllers/attempt.controller";

const router = Router();

router.get("/", all);
router.post("/", create);
router.get("/:param", find);

export default router;
