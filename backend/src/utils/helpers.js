/**
 * Enterprise Utilities, Custom DTOs, and Error Hierarchy
 */

/**
 * Standard API Response DTO
 */
class ApiResponse {
  constructor(statusCode = 200, data = null, message = 'Success', success = true) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null && data !== undefined) {
      this.data = data;
    }
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Success', statusCode = 200) {
    return new ApiResponse(statusCode, data, message, true);
  }

  static created(data, message = 'Created successfully') {
    return new ApiResponse(201, data, message, true);
  }

  static error(message = 'An error occurred', statusCode = 500, errors = null) {
    const res = new ApiResponse(statusCode, null, message, false);
    if (errors) res.errors = errors;
    return res;
  }
}

/**
 * Base Custom API Error
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errors = []) {
    super(message, 400, errors);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

/**
 * Higher-Order Function to catch async controller errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Input sanitizer to prevent XSS & Injection attacks
 */
const sanitizer = {
  sanitizeString(str, maxLength = 100000) {
    if (typeof str !== 'string') return str;
    let clean = str.trim();
    if (clean.length > maxLength) {
      clean = clean.substring(0, maxLength);
    }
    return clean
      // Strip script tags completely
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Strip dangerous tags: iframe, embed, object, applet, base, meta
      .replace(/<\/?(iframe|embed|object|applet|base|meta|link)\b[^>]*>/gi, '')
      // Strip inline javascript/vbscript protocols
      .replace(/javascript\s*:/gi, '')
      .replace(/vbscript\s*:/gi, '')
      .replace(/data\s*:\s*text\/html/gi, '')
      // Strip event handlers (onload, onerror, onclick, onfocus, etc.)
      .replace(/\s+on[a-zA-Z]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '');
  },

  sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
};

/**
 * Structured Logger
 */
const logger = {
  info(msg, meta = '') {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
  },
  warn(msg, meta = '') {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
  },
  error(msg, error = '') {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, error ? error : '');
  }
};

module.exports = {
  ApiResponse,
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
  asyncHandler,
  sanitizer,
  logger
};
