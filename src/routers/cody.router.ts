import { Router } from "express";
import { all, create, update } from "@controllers/cody.controller";

const router = Router();

router.get("/", all);
router.post("/", create);
router.patch("/:id", update);

export default router;
