// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Ensure file exists and exports User model

const router = express.Router();

/* ------------------------
   REGISTER
------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // check if already exists
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
        email: normalizedEmail, // always return normalized email
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

    // normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "YOUR_SECRET_KEY",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      user: {
        id: user._id,
        userName: user.name,
        email: user.email, // always normalized already
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------
   TEST ROUTE
------------------------- */
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working ✅" });
});

export default router;
