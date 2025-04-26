class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const catchAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => error.message);
  return new AppError(errors.join('. '), 400);
};

const handleMongooseDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists`, 400);
};

const handleMongooseCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

module.exports = {
  AppError,
  catchAsync,
  handleMongooseValidationError,
  handleMongooseDuplicateKeyError,
  handleMongooseCastError,
  handleJWTError,
  handleJWTExpiredError
};