const rateLimit = require('express-rate-limit');

// ─── RATE LIMITING ─────────────────────────────────────────────────────────────
// General API rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for login endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for registration
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registrations per hour
  message: 'Too many registration attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── SECURITY HEADERS ──────────────────────────────────────────────────────────
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self'; connect-src 'self' https:; media-src 'self' https: blob:;");
  
  // Allow cross-origin resource sharing for images and static files
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// ─── INPUT SANITIZATION ────────────────────────────────────────────────────────
/**
 * Sanitize user input to prevent XSS
 */
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  
  const entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'\/]/g, (char) => entities[char]);
};

/**
 * Sanitize object properties recursively
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeInput(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

// Middleware to sanitize req.body
const sanitizeRequestBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// ─── BODY SIZE LIMITS ──────────────────────────────────────────────────────────
const bodyLimits = {
  json: '1mb',
  urlencoded: '1mb'
};

module.exports = {
  limiter,
  loginLimiter,
  registrationLimiter,
  passwordResetLimiter,
  securityHeaders,
  sanitizeInput,
  sanitizeObject,
  sanitizeRequestBody,
  bodyLimits
};
