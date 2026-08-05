import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// Protects any route it's attached to. Expects the client to send:
//   Authorization: Bearer <token>
// If the token is valid, we attach req.userId so controllers know who's
// making the request. If not, we reject before the request reaches
// the controller at all.
const requireAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('You are not logged in. Please log in to continue.', 401);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired token. Please log in again.', 401);
  }

  req.userId = decoded.userId;
  next();
});

export default requireAuth;