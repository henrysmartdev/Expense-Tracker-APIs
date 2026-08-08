// NOTE: filename is 'erroHandler.js' (missing an 'r') to match what's
// already on disk in this project. If you'd rather fix the typo, rename
// the file AND update the import in App.js at the same time.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'A record with that value already exists (e.g. email taken).';
  }

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