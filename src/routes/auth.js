// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const router = express.Router();

/* ------------------------
   REGISTER
------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      name,
      email: normalizedEmail,
      password, // password will be hashed in pre-save hook
    });
    await newUser.save();

    // Generate email verification token
    const emailToken = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.EMAIL_SECRET || "EMAIL_SECRET_KEY",
      { expiresIn: "1h" }
    );

    const verificationUrl = `http://localhost:5000/api/auth/verify-email/${emailToken}`;

    return res.status(201).json({
      user: {
        id: newUser._id,
        userName: newUser.name,
        email: newUser.email,
      },
      emailToken,
      verificationUrl,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ------------------------
   VERIFY EMAIL
------------------------- */
router.get("/verify-email/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(
  req.params.token,
  process.env.EMAIL_SECRET || "EMAIL_SECRET_KEY"
);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    user.isEmailVerified = true;
    await user.save();

    return res.json({ message: "Email verified successfully ✅" });
  } catch (err) {
    console.error("Email verify error:", err.message);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
});


/* ------------------------
   LOGIN
------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    // ⚡ Do NOT block login — just include verification status in response
    return res.json({
      user: {
        id: user._id,
        userName: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified, // helpful info for frontend
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


/* ------------------------
   REFRESH TOKEN
------------------------- */
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.json({ accessToken });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

/* ------------------------
   LOGOUT
------------------------- */
router.post("/logout", (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
});

/* ------------------------
   TEST ROUTE
------------------------- */
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working ✅" });
});

export default router;

/* ------------------------
   FORGOT PASSWORD
------------------------- */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token (valid 15 min)
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_SECRET || "RESET_SECRET_KEY",
      { expiresIn: "15m" }
    );

    // Reset link
    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

    // TODO: send email with resetUrl (use nodemailer)
    console.log("Reset URL:", resetUrl);

    return res.json({
      message: "Password reset link generated",
      resetToken,
      resetUrl,
    });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------
   RESET PASSWORD
------------------------- */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.params.token,
      process.env.RESET_SECRET || "RESET_SECRET_KEY"
    );

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: "New password required" });

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    return res.json({ message: "Password reset successfully ✅" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
});

