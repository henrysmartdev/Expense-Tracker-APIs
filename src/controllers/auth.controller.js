import authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';

const signup = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.signup({ name, email, password });

  res.status(201).json({ data: { user, token } });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  res.status(200).json({ data: { user, token } });
});

export default { signup, login };