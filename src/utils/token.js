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
