import express from "express";
import { body } from "express-validator";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  verifyEmail,
} from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { handleValidation } from "../middleware/validation.js";

const router = express.Router();

// ✅ Register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
    handleValidation,
  ],
  registerController
);

// ✅ Auth routes
router.post("/login", authRateLimiter, loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.post("/forgot-password", authRateLimiter, forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);

// ✅ Email verification
router.get("/verify-email", verifyEmail);

export default router;
