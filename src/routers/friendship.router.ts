import { Router } from "express";
import { create, find, update } from "@controllers/friendship.controller";

const router = Router();

router.post("/", create);
router.get("/:identifier", find);
router.patch("/:id", update);

export default router;
