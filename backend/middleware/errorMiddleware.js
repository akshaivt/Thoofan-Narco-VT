/**
 * Centralized error handler middleware.
 * Formats validation issues and server errors into readable JSON structures.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = null;

  // Handle Zod Validation Errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    const keyName = Object.keys(err.keyValue)[0];
    message = `An account with this ${keyName} already exists.`;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field ${err.path}`;
  }

  // If status is still 500 in dev, print stack trace
  console.error(`[Error Handler] ${err.name || 'Error'}: ${err.message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  errorHandler
};
