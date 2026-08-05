import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import AppError from '../utils/AppError.js';

// Signs a JWT containing the user's id. This token is what the client
// sends back on every future request to prove who they are.
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

  // Password gets hashed automatically by the beforeSave hook on the model.
  const user = await User.create({ name, email, password });
  const token = signToken(user.id);

  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  // Deliberately vague message - don't reveal whether the email or the
  // password was the wrong part, so attackers can't enumerate accounts.
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password.', 401);
  }

  const token = signToken(user.id);
  return { user, token };
};

export default { signup, login };