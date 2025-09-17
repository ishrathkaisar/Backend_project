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

router.post("/email/send-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    //generate token (JWT or random string)
    const token = generateVerificationToken(user);

    // send email
    const VerificationUrl = 'http://localhost:5173/verify-email?token=${token}';
     await sendEmail({
      to: email,
      subject: "Verify your email",
      html: '<P>Click <a href="${verificationUrl}">here</a> to verify your email</p>',
     });

     res.status(200).json({ message: "Verification email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send verification email" });
  }
});

export default router;
