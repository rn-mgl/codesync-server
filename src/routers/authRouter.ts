import { login, register, verify } from "@controllers/authController.ts";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/verify/:token", verify);

export default router;
