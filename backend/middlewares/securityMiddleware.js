const helmet = require('helmet');
const hpp = require('hpp');
const { ConfigService } = require('../services/configService');

const setupSecurity = async (app) => {
  // Basic security headers
  app.use(helmet());

  // HTTP Parameter Pollution protection
  app.use(hpp());

  // Get allowed origins from environment or config
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? 
    process.env.CORS_ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000'];

  // CORS configuration
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // Content Security Policy
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      mediaSrc: ["'self'", 'blob:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }));

  // Enable Trust Proxy if behind reverse proxy
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Compression for responses
  if (process.env.NODE_ENV === 'production') {
    const compression = require('compression');
    app.use(compression());
  }

  // Security response headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });
};

module.exports = { setupSecurity };