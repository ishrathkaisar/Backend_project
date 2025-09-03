// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many requests, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
