import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import AppError from '../utils/AppError.js';

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const signup = async ({ name, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new AppError('An account with that email already exists.', 409);
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user.id);

  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password.', 401);
  }

  const token = signToken(user.id);
  return { user, token };
};

export default { signup, login };