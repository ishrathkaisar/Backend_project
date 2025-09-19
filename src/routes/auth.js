import express from "express";
import { body } from "express-validator";
import { handleValidation } from "../middleware/validation.js";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    handleValidation,
  ],
  registerController
);

// Login / Auth
router.post("/login", authRateLimiter, loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.post("/forgot-password", authRateLimiter, forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);

export default router;
