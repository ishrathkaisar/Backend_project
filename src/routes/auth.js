// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Ensure file exists and exports User model

const router = express.Router();

/* ------------------------
   Helper: Generate Tokens
------------------------- */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.ACCESS_SECRET || "ACCESS_SECRET_KEY",
    { expiresIn: "15m" } // short-lived
  );

  const refreshToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.REFRESH_SECRET || "REFRESH_SECRET_KEY",
    { expiresIn: "7d" } // long-lived
  );

  return { accessToken, refreshToken };
};

/* ------------------------
   REGISTER
------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email: normalizedEmail,
      password, // raw password → will be hashed by pre-save hook
    });
    await newUser.save();

    return res.status(201).json({
      user: {
        id: newUser._id,
        userName: newUser.name,
        email: normalizedEmail,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
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

    // ✅ This return is legal because it's inside the route
    return res.json({
      user: {
        id: user._id,
        userName: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
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
  // If you're storing refresh tokens in DB, remove it here.
  // If not, just tell client to delete tokens.
  return res.status(200).json({ message: "Logged out successfully" });
});

/* ------------------------
   TEST ROUTE
------------------------- */
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working ✅" });
});

export default router;
