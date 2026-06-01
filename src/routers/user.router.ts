import { Router } from "express";
import { find, update } from "@controllers/user.controller";

const router = Router();

router.get("/:id", find);

export default router;
