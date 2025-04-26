const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Ensure logs directory exists
const logDir = path.resolve(process.cwd(), 'logs');
fs.ensureDirSync(logDir);

// Define log format based on environment variable
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  process.env.LOG_FORMAT === 'json' ? 
    winston.format.json() :
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports: [
    // Write all logs with importance level of error or less to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with importance level of info or less to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, also log to the console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Custom error logger with metadata
const logError = (error, metadata = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...metadata
  });
};

// Custom info logger with metadata
const logInfo = (message, metadata = {}) => {
  logger.info({
    message,
    ...metadata
  });
};

// Custom debug logger with metadata
const logDebug = (message, metadata = {}) => {
  logger.debug({
    message,
    ...metadata
  });
};

// Log HTTP requests
const logRequest = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      type: 'request',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
};

// Log errors in the error handling middleware
const logErrorMiddleware = (err, req, res, next) => {
  logError(err, {
    type: 'middleware_error',
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id
  });
  next(err);
};

// Create rotating file stream for access logs
const createRotatingLogStream = () => {
  const pad = num => (num > 9 ? "" : "0") + num;
  const generator = (time, index) => {
    if (!time) return path.join(logDir, "access.log");

    const month = time.getFullYear() + "" + pad(time.getMonth() + 1);
    const day = pad(time.getDate());
    return path.join(logDir, `access-${month}${day}-${index}.log`);
  };

  return require('rotating-file-stream').createStream(generator, {
    size: '10M', // Rotate every 10 MegaBytes
    interval: '1d', // Rotate daily
    compress: 'gzip', // Compress rotated files
    maxFiles: 7 // Keep logs for 7 days
  });
};

module.exports = {
  logger,
  logError,
  logInfo,
  logDebug,
  logRequest,
  logErrorMiddleware,
  createRotatingLogStream
};