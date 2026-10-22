const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const config = require('./config/config');
const routes = require('./routes/routes');
const {
  corsMiddleware,
  securityHeaders,
  sessionMiddleware,
  apiLimiter,
  errorHandler
} = require('./middlewares/middleware');

const app = express();

// Trust reverse proxy (Nginx / CloudPanel SSL termination)
app.set('trust proxy', 1);

// Disable information disclosure headers
app.disable('x-powered-by');

// 1. Security & Network Middlewares
app.use(corsMiddleware);
app.options('*', corsMiddleware);
app.use(securityHeaders);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sessionMiddleware);

// 1.5. Strict Path Traversal & Sensitive File Leakage Guard
app.use((req, res, next) => {
  const p = req.path.toLowerCase();

  // Block directory traversal attempts
  if (p.includes('..') || req.url.includes('%2e%2e') || req.url.includes('..')) {
    return res.status(400).json({ success: false, message: 'Invalid request path.' });
  }

  // Block sensitive files, dotfiles, and backend source files
  const sensitivePatterns = [
    /^\/\./,              // Any dotfile at root (/.env, /.git)
    /\/\./,               // Any nested dotfile (/foo/.env)
    /package\.json$/i,
    /package-lock\.json$/i,
    /data_store\.json$/i,
    /server\.js$/i,
    /^\/backend(\/|$)/i,
    /^\/prisma(\/|$)/i,
    /^\/node_modules(\/|$)/i
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(p)) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
  }

  next();
});

// 2. API Routes (Global API Rate Limiting Applied)
app.use('/api', apiLimiter, routes);

// 3. Static Media & Uploads Serving
const staticOptions = {
  dotfiles: 'ignore',
  index: false
};

app.use('/uploads', express.static(config.upload.destDir, staticOptions));
if (fs.existsSync(config.upload.frontendUploadDir)) {
  app.use('/uploads', express.static(config.upload.frontendUploadDir, staticOptions));
}

// 3.5. Legacy Subpage Redirects (e.g. /education/index.html -> /initiatives/education)
const legacyInitiativeRedirects = {
  '/education': '/initiatives/education',
  '/education/': '/initiatives/education',
  '/education/index.html': '/initiatives/education',
  '/health': '/initiatives/health',
  '/health/': '/initiatives/health',
  '/health/index.html': '/initiatives/health',
  '/infrastructure-transport-mobility': '/initiatives/infrastructure-transport-mobility',
  '/infrastructure-transport-mobility/': '/initiatives/infrastructure-transport-mobility',
  '/infrastructure-transport-mobility/index.html': '/initiatives/infrastructure-transport-mobility',
  '/sports': '/initiatives/sports',
  '/sports/': '/initiatives/sports',
  '/sports/index.html': '/initiatives/sports',
  '/policy-and-parliamentary-work': '/initiatives/policy-and-parliamentary-work',
  '/policy-and-parliamentary-work/': '/initiatives/policy-and-parliamentary-work',
  '/policy-and-parliamentary-work/index.html': '/initiatives/policy-and-parliamentary-work',
  '/constituency-projects': '/initiatives/constituency-projects',
  '/constituency-projects/': '/initiatives/constituency-projects',
  '/constituency-projects/index.html': '/initiatives/constituency-projects',
  '/security': '/initiatives/security',
  '/security/': '/initiatives/security',
  '/security/index.html': '/initiatives/security',
  '/labour': '/initiatives/labour',
  '/labour/': '/initiatives/labour',
  '/labour/index.html': '/initiatives/labour'
};

app.use((req, res, next) => {
  if (legacyInitiativeRedirects[req.path]) {
    return res.redirect(301, legacyInitiativeRedirects[req.path]);
  }
  next();
});

// 4. Static Frontend Assets Serving
if (fs.existsSync(config.paths.frontendPublic)) {
  app.use(express.static(config.paths.frontendPublic, staticOptions));
}
if (fs.existsSync(config.paths.frontendRoot)) {
  app.use(express.static(config.paths.frontendRoot, staticOptions));
}

// Reference static fallback if present
const referenceStatic = path.join(config.paths.referenceFolder, 'tejasvisurya.in', '_next', 'static');
if (fs.existsSync(referenceStatic)) {
  app.use('/_next/static', express.static(referenceStatic, staticOptions));
}

// 5. Catch-All Route for SPA & Subpages
app.get('*', (req, res, next) => {
  // If request is for an API route that was not matched, pass to 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }

  // Admin Dashboard route
  if (req.path === '/admin' || req.path.startsWith('/admin/')) {
    const adminPath = path.join(config.paths.frontendRoot, 'admin', 'index.html');
    const publicAdminPath = path.join(config.paths.frontendPublic, 'admin', 'index.html');
    if (fs.existsSync(adminPath)) return res.sendFile(adminPath);
    if (fs.existsSync(publicAdminPath)) return res.sendFile(publicAdminPath);
  }

  // Handle all /initiatives/:slug dynamic routes
  if (req.path.startsWith('/initiatives/')) {
    const templatePath = path.join(config.paths.frontendPublic, 'initiatives', 'index.html');
    if (fs.existsSync(templatePath)) return res.sendFile(templatePath);
    const fallbackPath = path.join(config.paths.frontendPublic, 'education', 'index.html');
    return res.sendFile(fallbackPath);
  }

  // Main Website route
  const indexPath = path.join(config.paths.frontendPublic, 'index.html');
  const rootIndexPath = path.join(config.paths.frontendRoot, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  if (fs.existsSync(rootIndexPath)) return res.sendFile(rootIndexPath);

  next();
});

// 6. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
