import { Router } from "express";
import { find, update } from "@controllers/user.controller";

const router = Router();

router.get("/:id", find);
router.patch("/:id", update);

export default router;
