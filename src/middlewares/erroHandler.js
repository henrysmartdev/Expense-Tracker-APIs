
// Express recognizes this as an error-handling middleware because it takes
// 4 arguments. Any error passed to next(err) - including ones thrown inside
// catchAsync-wrapped controllers - ends up here.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Sequelize-specific errors get translated into friendlier messages
  // and a proper 4xx status instead of leaking a raw 500.
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'A record with that value already exists (e.g. email taken).';
  }

  // Only log full stack traces for unexpected (non-operational) errors,
  // so your logs aren't flooded with "expected" 400s and 404s.
  if (!err.isOperational) {
    console.error('UNEXPECTED ERROR:', err);
  }

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode >= 500 ? 'error' : 'fail',
    },
  });
};

export default errorHandler;