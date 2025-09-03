import User from '../models/userModel.js';
import { generateTokens } from '../utils/token.js';

export async function register({ name, email, password }) {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const user = await User.create({ name, email, password });

  // Generate tokens immediately after registration
  const tokens = generateTokens(user.id);

  return { user: sanitize(user), tokens };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = generateTokens(user.id);

  return { user: sanitize(user), tokens };
}

function sanitize(user) {
  const { _id, name, email, isEmailVerified, createdAt, updatedAt } = user;
  return { id: _id, name, email, isEmailVerified, createdAt, updatedAt };
}
