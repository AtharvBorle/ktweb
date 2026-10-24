const express = require('express');
const router = express.Router();
const apiController = require('../controllers/ApiController');
const adminController = require('../controllers/AdminController');
const {
  authLimiter,
  contactLimiter,
  checkLoginLockout,
  verifyAdminOrigin,
  requireAdmin,
  upload,
  validateAndSanitizeUpload,
  mirrorUpload
} = require('../middlewares/middleware');

// =================================================================
// PUBLIC ROUTES
// =================================================================

// Health Check Endpoint (Monitoring & Probe)
router.get('/health-check', apiController.healthCheck);

// Get all website content
router.get('/content', apiController.getContent);

// Submit contact inquiries (rate-limited)
router.post('/contact', contactLimiter, apiController.submitContact);

// =================================================================
// ADMIN AUTH & QR GENERATOR ROUTES
// =================================================================

// Admin Login (Throttled & Brute-Force Guarded)
router.post('/admin/login', authLimiter, checkLoginLockout, adminController.login);

// Check current session
router.get('/admin/me', requireAdmin, adminController.getMe);

// Logout
router.post('/admin/logout', adminController.logout);

// Admin Password Management & Security Auditing
router.put('/admin/change-password', requireAdmin, verifyAdminOrigin, adminController.changePassword);
router.get('/admin/security-status', requireAdmin, adminController.getSecurityStatus);

// Clean QR Code Generator (Public / Admin utility)
router.get('/admin/generate-qr', adminController.generateQr);

// Secure File Upload (Type, Signature & SVG Sanitization Guarded)
router.post('/admin/upload', requireAdmin, verifyAdminOrigin, upload.single('file'), validateAndSanitizeUpload, mirrorUpload, adminController.uploadFile);

// =================================================================
// ADMIN CMS CRUD ROUTES (PROTECTED + CSRF/ORIGIN VERIFIED)
// =================================================================

// Settings & Sections
router.put('/admin/settings', requireAdmin, verifyAdminOrigin, adminController.updateSettings);
router.put('/admin/hero', requireAdmin, verifyAdminOrigin, adminController.updateHero);
router.put('/admin/organization', requireAdmin, verifyAdminOrigin, adminController.updateOrganization);

// Main Initiatives (Carousel Cards)
router.post('/admin/initiatives', requireAdmin, verifyAdminOrigin, adminController.saveInitiative);
router.delete('/admin/initiatives/:id', requireAdmin, verifyAdminOrigin, adminController.deleteInitiative);

// Initiative Pillars (8 Core Sector Pillars & Subpage Intros)
router.post('/admin/initiative-pillars', requireAdmin, verifyAdminOrigin, adminController.saveInitiativePillar);
router.delete('/admin/initiative-pillars/:id', requireAdmin, verifyAdminOrigin, adminController.deleteInitiativePillar);

// Key Highlights
router.post('/admin/key-highlights', requireAdmin, verifyAdminOrigin, adminController.saveKeyHighlight);
router.delete('/admin/key-highlights/:id', requireAdmin, verifyAdminOrigin, adminController.deleteKeyHighlight);

// Meet Kunal Slides
router.post('/admin/meet-kunal', requireAdmin, verifyAdminOrigin, adminController.saveMeetKunalSlide);
router.delete('/admin/meet-kunal/:id', requireAdmin, verifyAdminOrigin, adminController.deleteMeetKunalSlide);

// Parliament Items
router.post('/admin/parliament-items', requireAdmin, verifyAdminOrigin, adminController.saveParliamentItem);
router.delete('/admin/parliament-items/:id', requireAdmin, verifyAdminOrigin, adminController.deleteParliamentItem);
router.post('/admin/parliament', requireAdmin, verifyAdminOrigin, adminController.saveParliamentItem);
router.delete('/admin/parliament/:id', requireAdmin, verifyAdminOrigin, adminController.deleteParliamentItem);

// Sector Initiatives (Education, Health, Infra, Mobility, Labour, Security, Sports)
router.post('/admin/sector-initiatives', requireAdmin, verifyAdminOrigin, adminController.saveSectorItem);
router.delete('/admin/sector-initiatives/:id', requireAdmin, verifyAdminOrigin, adminController.deleteSectorItem);
router.post('/admin/sectors', requireAdmin, verifyAdminOrigin, adminController.saveSectorItem);
router.delete('/admin/sectors/:id', requireAdmin, verifyAdminOrigin, adminController.deleteSectorItem);

// Constituency Projects
router.post('/admin/constituency-projects', requireAdmin, verifyAdminOrigin, adminController.saveConstituencyProject);
router.delete('/admin/constituency-projects/:id', requireAdmin, verifyAdminOrigin, adminController.deleteConstituencyProject);
router.post('/admin/projects', requireAdmin, verifyAdminOrigin, adminController.saveConstituencyProject);
router.delete('/admin/projects/:id', requireAdmin, verifyAdminOrigin, adminController.deleteConstituencyProject);

// Blogs
router.post('/admin/blogs', requireAdmin, verifyAdminOrigin, adminController.saveBlogPost);
router.delete('/admin/blogs/:id', requireAdmin, verifyAdminOrigin, adminController.deleteBlogPost);

// Gallery
router.post('/admin/gallery', requireAdmin, verifyAdminOrigin, adminController.saveGalleryItem);
router.delete('/admin/gallery/:id', requireAdmin, verifyAdminOrigin, adminController.deleteGalleryItem);

// Report Cards
router.post('/admin/report-cards', requireAdmin, verifyAdminOrigin, adminController.saveReportCard);
router.delete('/admin/report-cards/:id', requireAdmin, verifyAdminOrigin, adminController.deleteReportCard);

// Contact Messages Inbox
router.get('/admin/messages', requireAdmin, adminController.getMessages);
router.delete('/admin/messages/:id', requireAdmin, verifyAdminOrigin, adminController.deleteMessage);

// Categories Management
router.get('/admin/categories', adminController.getCategories);
router.post('/admin/categories', requireAdmin, verifyAdminOrigin, adminController.saveCategory);
router.delete('/admin/categories/:id', requireAdmin, verifyAdminOrigin, adminController.deleteCategory);

module.exports = router;
