import { Router } from "express";
import { all, create, find } from "@controllers/cody.controller";

const router = Router();

router.get("/", all);
router.post("/", create);
router.get("/:identifier", find);

export default router;
