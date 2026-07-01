import { Router } from "express";
import { all, create, update, find } from "@controllers/cody.controller";

const router = Router();

router.get("/", all);
router.post("/", create);
router.patch("/:id", update);
router.get("/:id", find);

export default router;
