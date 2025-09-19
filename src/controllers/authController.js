import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// REGISTER
export const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email: normalizedEmail, password });
    await newUser.save();

    const emailToken = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.EMAIL_SECRET || "EMAIL_SECRET_KEY",
      { expiresIn: "1h" }
    );

    const verificationUrl = `http://localhost:5000/api/auth/verify-email/${emailToken}`;

    res.status(201).json({
      user: { id: newUser._id, userName: newUser.name, email: newUser.email },
      emailToken,
      verificationUrl,
    });
  } catch (err) {
    next(err);
  }
};

// LOGIN
export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User does not exist" });

    const isMatch = await user.matchPassword(password);
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

    res.json({
      user: {
        id: user._id,
        userName: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// REFRESH
export const refreshController = (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// LOGOUT
export const logoutController = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

// FORGOT PASSWORD
export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_SECRET || "RESET_SECRET_KEY",
      { expiresIn: "15m" }
    );

    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
    console.log("Reset URL:", resetUrl);

    res.json({ message: "Password reset link generated", resetToken, resetUrl });
  } catch (err) {
    next(err);
  }
};

// RESET PASSWORD
export const resetPasswordController = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const decoded = jwt.verify(
      req.params.token,
      process.env.RESET_SECRET || "RESET_SECRET_KEY"
    );

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successfully ✅" });
  } catch (err) {
    next(err);
  }
};
