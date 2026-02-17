import {
  login,
  register,
  verify,
  forgot,
  reset,
} from "@controllers/authController.ts";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot", forgot);
router.patch("/verify", verify);
router.patch("/reset", reset);

export default router;
