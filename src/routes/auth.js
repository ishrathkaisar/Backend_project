import express from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { handleValidation } from "../middleware/validation.js";
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

const router = express.Router();

/* ------------------------
   REGISTER
------------------------- */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
    handleValidation,
  ],
  registerController // ✅ delegate logic to controller
);

/* ------------------------
   AUTH ROUTES
------------------------- */
router.post("/login", authRateLimiter, loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.post("/forgot-password", authRateLimiter, forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);

/* ------------------------
   VERIFY EMAIL
------------------------- */
router.get("/verify-email", verifyEmail);


export default router;
