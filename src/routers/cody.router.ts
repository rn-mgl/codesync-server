import { Router } from "express";
import { create } from "@controllers/cody.controller";

const router = Router();

router.post("/", create);

export default router;
