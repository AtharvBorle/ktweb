const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env in backend root or parent
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  
  session: {
    secret: process.env.SESSION_SECRET || 'kunaltilak_session_secret_enterprise_2026',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'kunaltilak_jwt_secret_key_2026',
    expiresIn: '24h'
  },

  database: {
    url: process.env.DATABASE_URL || '',
    provider: process.env.DB_PROVIDER || 'postgresql',
    localStorePath: path.join(__dirname, '..', '..', 'data', 'data_store.json')
  },

  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://localhost:5001',
        'http://127.0.0.1:5001',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://kunaltilak.com',
        'https://www.kunaltilak.com',
        'https://api.kunaltilak.com',
        'https://dev.kunaltilak.com',
        'https://dev.api.kunaltilak.com',
        'https://office.kunaltilak.com',
        'https://dev.office.kunaltilak.com',
        'https://api.office.kunaltilak.com',
        'https://dev.api.office.kunaltilak.com'
      ];

      // Allow requests with no origin (like mobile apps, curl, server-side requests)
      if (!origin) {
        return callback(null, true);
      }

      // Check explicit allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any subdomain of kunaltilak.com / kunaltilak.in
      if (/^https?:\/\/([a-z0-9-]+\.)*kunaltilak\.(com|in)(:\d+)?$/i.test(origin)) {
        return callback(null, true);
      }

      // Check custom comma-separated origins from environment variables
      if (process.env.ALLOWED_ORIGINS) {
        const customList = process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
        if (customList.includes(origin)) {
          return callback(null, true);
        }
      }

      // In non-production environments, allow all localhost and testing origins
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error(`Blocked by CORS policy for origin: ${origin}`));
    },
    credentials: true
  },

  rateLimits: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // 500 requests per window
      message: 'Too many requests from this IP, please try again later.'
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 15, // 15 login attempts
      message: 'Too many login attempts, please try again after 15 minutes.'
    },
    contact: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 contact messages per hour
      message: 'You have submitted too many contact messages. Please try again later.'
    }
  },

  upload: {
    destDir: path.join(__dirname, '..', '..', 'uploads'),
    frontendUploadDir: path.join(__dirname, '..', '..', '..', 'frontend', 'public', 'uploads'),
    maxFileSize: 10 * 1024 * 1024, // 10 MB limit
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf']
  },

  paths: {
    frontendRoot: path.join(__dirname, '..', '..', '..', 'frontend'),
    frontendPublic: path.join(__dirname, '..', '..', '..', 'frontend', 'public'),
    referenceFolder: path.join(__dirname, '..', '..', '..', 'reference folder')
  }
};

module.exports = Object.freeze(config);
