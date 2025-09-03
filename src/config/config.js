import dotenv from 'dotenv';
dotenv.config();

const requireEnv = (key, fallback = undefined) => {
  const v = process.env[key] ?? fallback;
  if (v === undefined) throw new Error(`Missing env: ${key}`);
  return v;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: requireEnv('MONGO_URI'),
  corsOrigin: requireEnv('CORS_ORIGIN', '*'),
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: requireEnv('JWT_EXPIRES_IN', '15m'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    refreshExpiresIn: requireEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  rateLimit: {
    windowMs: Number(requireEnv('RATE_LIMIT_WINDOW_MS', '900000')),
    max: Number(requireEnv('RATE_LIMIT_MAX', '100')),
  },
};
