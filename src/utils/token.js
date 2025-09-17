// src/utils/token.js
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
}

export function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

const jwt = require("jsonwebtoken");

function generateVerificationToken(user) {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

module.exports = { generateVerificationToken };