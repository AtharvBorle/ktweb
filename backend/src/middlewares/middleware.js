const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const { ApiResponse, ApiError, UnauthorizedError, BadRequestError, logger } = require('../utils/helpers');

// Ensure upload directories exist
[config.upload.destDir, config.upload.frontendUploadDir].forEach(dir => {
  if (dir && !fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      logger.warn(`Could not create directory ${dir}: ${e.message}`);
    }
  }
});

// 1. CORS Middleware
const corsMiddleware = cors(config.cors);

// 2. Helmet Security Headers with Safe Resource Policies & Hardened CSP
const securityHeaders = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: [
          "'self'",
          "http://localhost:*",
          "http://127.0.0.1:*",
          "https://*.kunaltilak.com",
          "https://kunaltilak.com",
          "https://*.kunaltilak.in",
          "https://kunaltilak.in"
        ],
        frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com", "https://instagram.com", "https://www.facebook.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "sameorigin" },
    hidePoweredBy: true,
    hsts: config.env === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  }),
  // Permissions-Policy & Anti-cache header for dynamic live CMS updates
  (req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  }
];

// 3. Express Session Middleware
const sessionMiddleware = session(config.session);

// 4. Rate Limiters
const apiLimiter = rateLimit({
  windowMs: config.rateLimits.general.windowMs,
  max: config.rateLimits.general.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: config.rateLimits.general.message }
});

const authLimiter = rateLimit({
  windowMs: config.rateLimits.auth.windowMs,
  max: config.rateLimits.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: config.rateLimits.auth.message }
});

const contactLimiter = rateLimit({
  windowMs: config.rateLimits.contact.windowMs,
  max: config.rateLimits.contact.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: config.rateLimits.contact.message }
});

// 4.5. In-Memory Failed Login Lockout Tracker
const failedLoginTracker = new Map();

const trackFailedLogin = (ip) => {
  const now = Date.now();
  const record = failedLoginTracker.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = now + (5 * 60 * 1000); // 5-minute lockout
    logger.warn(`Security alert: IP ${ip} temporarily locked out due to 5 consecutive failed login attempts.`);
  }
  failedLoginTracker.set(ip, record);
};

const checkLoginLockout = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const record = failedLoginTracker.get(ip);
  if (record && record.lockedUntil > Date.now()) {
    const remainingSeconds = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return res.status(429).json(ApiResponse.error(
      `Account security lockout: Too many failed login attempts. Please wait ${remainingSeconds} seconds before retrying.`,
      429
    ));
  }
  next();
};

const clearFailedLogin = (ip) => {
  failedLoginTracker.delete(ip);
};

// 4.6. Origin / CSRF Verification for State-Changing Requests
const verifyAdminOrigin = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // If programmatic Bearer token is provided, allow
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;
  if (!origin) {
    if (config.env !== 'production') {
      return next();
    }
    return res.status(403).json(ApiResponse.error('Missing origin header.', 403));
  }

  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host.toLowerCase();
    const serverHost = (req.headers.host || '').toLowerCase();

    // 1. Same-host request
    if (originHost === serverHost) {
      return next();
    }

    // 2. Allowed domain names (including subdomains of kunaltilak.com and kunaltilak.in)
    if (
      originHost.endsWith('kunaltilak.com') ||
      originHost.endsWith('kunaltilak.in') ||
      originHost.includes('kunaltilak')
    ) {
      return next();
    }

    // 3. Localhost development environments
    const allowedLocal = [
      'localhost:5000',
      '127.0.0.1:5000',
      'localhost:5001',
      '127.0.0.1:5001',
      'localhost:3000',
      '127.0.0.1:3000',
      'localhost:5500',
      '127.0.0.1:5500'
    ];
    if (allowedLocal.includes(originHost)) {
      return next();
    }

    return res.status(403).json(ApiResponse.error('Cross-site request blocked by origin verification.', 403));
  } catch (e) {
    return res.status(403).json(ApiResponse.error('Invalid request origin.', 403));
  }
};

// 5. Admin Authentication Guard Middleware
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next();
  }
  // Check Bearer JWT token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token !== 'undefined' && token !== 'null') {
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.admin = decoded;
        return next();
      } catch (e) {
        throw new UnauthorizedError('Invalid or expired token. Please login again.');
      }
    }
  }

  throw new UnauthorizedError('Unauthorized. Please login as admin.');
};

// 6. Multer Safe File Uploader
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.destDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E6)}`;
    const filename = `${basename}_${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (
    config.upload.allowedMimeTypes.includes(file.mimetype) &&
    config.upload.allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file format: ${ext}. Only images and PDFs are permitted.`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter
});

// Helper: Magic Bytes Validation
function verifyMagicBytes(buffer, ext) {
  const e = ext.toLowerCase();
  if (e === '.jpg' || e === '.jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  if (e === '.png') {
    return buffer.length >= 8 &&
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A;
  }
  if (e === '.gif') {
    return buffer.length >= 4 && buffer.toString('ascii', 0, 4) === 'GIF8';
  }
  if (e === '.pdf') {
    return buffer.length >= 4 && buffer.toString('ascii', 0, 4) === '%PDF';
  }
  if (e === '.webp') {
    return buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  if (e === '.svg') {
    const text = buffer.toString('utf8', 0, Math.min(buffer.length, 1000)).trim().toLowerCase();
    return text.includes('<svg') || text.includes('<?xml');
  }
  return false;
}

// Helper: Deep SVG Sanitization
function sanitizeSvgString(rawSvg) {
  if (/<!entity/i.test(rawSvg) || /<!doctype[^>]*system/i.test(rawSvg)) {
    throw new BadRequestError('SVG rejected: contains disallowed XML entity definitions.');
  }

  return rawSvg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+on[a-zA-Z]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"')
    .replace(/xlink:href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'xlink:href="#"');
}

// 6.5. Post-Upload Magic Byte & SVG Verification Middleware
const validateAndSanitizeUpload = (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const ext = path.extname(req.file.filename).toLowerCase();

  try {
    const buffer = fs.readFileSync(filePath);
    
    // Verify magic bytes
    if (!verifyMagicBytes(buffer, ext)) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      throw new BadRequestError(`File signature mismatch for ${ext}. Upload rejected for security.`);
    }

    // Sanitize SVG if applicable
    if (ext === '.svg') {
      const svgText = buffer.toString('utf8');
      const cleanSvg = sanitizeSvgString(svgText);
      fs.writeFileSync(filePath, cleanSvg, 'utf8');
    }

    next();
  } catch (err) {
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
    next(err);
  }
};

// Helper to mirror uploads to frontend if available
const mirrorUpload = (req, res, next) => {
  if (req.file && config.upload.frontendUploadDir && fs.existsSync(config.upload.frontendUploadDir)) {
    try {
      const srcPath = req.file.path;
      const destPath = path.join(config.upload.frontendUploadDir, req.file.filename);
      fs.copyFileSync(srcPath, destPath);
    } catch (e) {
      logger.warn(`Upload mirror copy error: ${e.message}`);
    }
  }
  next();
};

// 7. Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  logger.error(`Error processing ${req.method} ${req.originalUrl}: ${err.message}`, err.stack);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      ApiResponse.error(err.message, err.statusCode, err.errors.length ? err.errors : null)
    );
  }

  // Multer Errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json(ApiResponse.error(`File upload error: ${err.message}`, 400));
  }

  // Generic 500 Unhandled Error
  const message = config.env === 'production' ? 'Internal server error' : err.message;
  return res.status(500).json(ApiResponse.error(message, 500));
};

module.exports = {
  corsMiddleware,
  securityHeaders,
  sessionMiddleware,
  apiLimiter,
  authLimiter,
  contactLimiter,
  checkLoginLockout,
  trackFailedLogin,
  clearFailedLogin,
  verifyAdminOrigin,
  requireAdmin,
  upload,
  validateAndSanitizeUpload,
  mirrorUpload,
  errorHandler
};
