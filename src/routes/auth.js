// src/routes/auth.js
import express from "express";
import {
  registerUser,
  loginUser,
  refreshToken,    // ✅ refresh access token
  logoutUser,      // ✅ logout
  verifyEmail,     // ✅ email verification
  forgotPassword,  // ✅ forgot password
  resetPassword    // ✅ reset password
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);

// Email verification
router.post("/verify-email", verifyEmail);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working" });
});

export default router;
