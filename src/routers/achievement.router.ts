import { Router } from "express";
import { create, find, update, all } from "@controllers/achievement.controller";

const router = Router();

router.get("/", all);
router.post("/", create);
router.get("/:identifier", find);
router.patch("/:id", update);

export default router;
