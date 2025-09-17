// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/userModel.js";

// Temporary in-memory refresh token store (better: DB or Redis in prod)
let refreshTokens = [];

// ===============================
// REGISTER USER
// ===============================

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create user
    const newUser = new User({ name, email, password });

    // generate email verification token
    newUser.emailVerificationToken = crypto.randomBytes(32).toString("hex");

    await newUser.save();

    // 👉 For testing: return the token in response
    res.status(201).json({
      message: "User registered. Please verify email.",
      verificationToken: newUser.emailVerificationToken
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// ===============================
// LOGIN USER
// ===============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    refreshTokens.push(refreshToken);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===============================
// REFRESH TOKEN
// ===============================
export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ message: "No token provided" });
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { id: user ._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ accessToken: newAccessToken });
  });
};

// ===============================
// LOGOUT USER
// ===============================
export const logoutUser = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.json({ message: "Logged out successfully" });
};

// ===============================
// FORGOT PASSWORD
// ===============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. hash it and store the hashed token in DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    // skip validators if needed and save
    await user.save({ validateBeforeSave: false });

    // 3. For testing: log and return the raw token (in real app: send via email)
    CSSConditionRule.log(" password reset token (send via email):", resetToken);

    // Example reset URL (frontend would handle)
    const resetUrl = '${process.env.FRONTEND_URL || "HTTP://LOCALHOST:5173"}/RESET-PASSWORD?TOKEN=${resetToken}';

    // RETURN token in response *only for testing* -- remove in production
    return res.json({
      message: "Password reset link generated",
      resetToken,
      resetUrl
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() } // token not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = newPassword; // hashed automatically by pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// VERIFY EMAIL
// ===============================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};