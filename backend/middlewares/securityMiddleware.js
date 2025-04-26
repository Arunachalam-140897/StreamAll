const helmet = require('helmet');
const hpp = require('hpp');
const { ConfigService } = require('../services/configService');

const setupSecurity = async (app) => {
  // Basic security headers
  app.use(helmet());

  // HTTP Parameter Pollution protection
  app.use(hpp());

  // Enable Trust Proxy for all environments
  app.set('trust proxy', 1);

  // Get development frontend URL
  const developmentOrigins = ['http://localhost:3000', 'http://localhost:5173'];

  // Content Security Policy
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", ...developmentOrigins],
      scriptSrc: ["'self'", "'unsafe-inline'", ...developmentOrigins],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', ...developmentOrigins],
      mediaSrc: ["'self'", 'blob:', ...developmentOrigins],
      connectSrc: ["'self'", ...developmentOrigins],
      frameSrc: ["'none'"]
    }
  }));

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