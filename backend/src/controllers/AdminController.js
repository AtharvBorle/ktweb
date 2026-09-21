const authService = require('../services/AuthService');
const contentService = require('../services/ContentService');
const { ApiResponse, BadRequestError, UnauthorizedError, asyncHandler } = require('../utils/helpers');
const { trackFailedLogin, clearFailedLogin } = require('../middlewares/middleware');

/**
 * OOP Admin & CMS Management Controller
 */
class AdminController {
  // --- Authentication Endpoints ---

  login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    try {
      const { admin, token } = await authService.login(username, password);

      // Clear any failed attempts for this IP
      clearFailedLogin(ip);

      // Session Regeneration against Session Fixation attacks
      req.session.regenerate((err) => {
        req.session.admin = admin;
        return res.status(200).json(ApiResponse.success({ admin, token }, 'Login successful'));
      });
    } catch (err) {
      trackFailedLogin(ip);
      throw err;
    }
  });

  getMe = asyncHandler(async (req, res) => {
    const admin = req.session && req.session.admin ? req.session.admin : req.admin;
    if (!admin) {
      return res.status(401).json(ApiResponse.error('Not authenticated', 401));
    }
    return res.status(200).json(ApiResponse.success({ admin }, 'Authenticated'));
  });

  logout = asyncHandler(async (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
    });
  });

  changePassword = asyncHandler(async (req, res) => {
    const admin = req.session && req.session.admin ? req.session.admin : req.admin;
    if (!admin) {
      throw new UnauthorizedError('Not authenticated');
    }
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(admin.id, currentPassword, newPassword);
    return res.status(200).json(ApiResponse.success(result, 'Password updated successfully'));
  });

  getSecurityStatus = asyncHandler(async (req, res) => {
    const admin = req.session && req.session.admin ? req.session.admin : req.admin;
    if (!admin) {
      throw new UnauthorizedError('Not authenticated');
    }
    const status = await authService.getSecurityStatus(admin.id);
    return res.status(200).json(ApiResponse.success(status, 'Security status retrieved'));
  });

  // --- QR Code Generator ---

  generateQr = asyncHandler(async (req, res) => {
    const result = await contentService.generateCleanQrCode(req.query.text);
    return res.status(200).json(ApiResponse.success(result, 'QR Code generated successfully'));
  });

  // --- File Upload ---

  uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new BadRequestError('No file provided for upload.');
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json(ApiResponse.created({ url: fileUrl, filename: req.file.filename }, 'File uploaded successfully'));
  });

  // --- Settings & Static Sections ---

  updateSettings = asyncHandler(async (req, res) => {
    const updated = await contentService.updateSettings(req.body);
    return res.status(200).json(ApiResponse.success(updated, 'Settings updated successfully'));
  });

  updateHero = asyncHandler(async (req, res) => {
    const updated = await contentService.updateHero(req.body);
    return res.status(200).json(ApiResponse.success(updated, 'Hero section updated successfully'));
  });

  updateOrganization = asyncHandler(async (req, res) => {
    const updated = await contentService.updateOrganization(req.body);
    return res.status(200).json(ApiResponse.success(updated, 'Organization updated successfully'));
  });

  // --- Main Initiatives ---

  saveInitiative = asyncHandler(async (req, res) => {
    const data = await contentService.saveInitiative(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Initiative saved successfully'));
  });

  deleteInitiative = asyncHandler(async (req, res) => {
    await contentService.deleteInitiative(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Initiative deleted successfully'));
  });

  // --- Initiative Pillars ---

  saveInitiativePillar = asyncHandler(async (req, res) => {
    const data = await contentService.saveInitiativePillar(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Initiative Pillar saved successfully'));
  });

  deleteInitiativePillar = asyncHandler(async (req, res) => {
    await contentService.deleteInitiativePillar(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Initiative Pillar deleted successfully'));
  });

  // --- Key Highlights ---

  saveKeyHighlight = asyncHandler(async (req, res) => {
    const data = await contentService.saveKeyHighlight(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Key Highlight saved successfully'));
  });

  deleteKeyHighlight = asyncHandler(async (req, res) => {
    await contentService.deleteKeyHighlight(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Key Highlight deleted successfully'));
  });

  // --- Meet Kunal ---

  saveMeetKunalSlide = asyncHandler(async (req, res) => {
    const data = await contentService.saveMeetKunalSlide(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Meet Kunal slide saved successfully'));
  });

  deleteMeetKunalSlide = asyncHandler(async (req, res) => {
    await contentService.deleteMeetKunalSlide(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Meet Kunal slide deleted successfully'));
  });

  // --- Parliament Items ---

  saveParliamentItem = asyncHandler(async (req, res) => {
    const data = await contentService.saveParliamentItem(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Parliament item saved successfully'));
  });

  deleteParliamentItem = asyncHandler(async (req, res) => {
    await contentService.deleteParliamentItem(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Parliament item deleted successfully'));
  });

  // --- Sector Initiatives ---

  saveSectorItem = asyncHandler(async (req, res) => {
    const data = await contentService.saveSectorItem(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Sector initiative saved successfully'));
  });

  deleteSectorItem = asyncHandler(async (req, res) => {
    await contentService.deleteSectorItem(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Sector initiative deleted successfully'));
  });

  // --- Constituency Projects ---

  saveConstituencyProject = asyncHandler(async (req, res) => {
    const data = await contentService.saveConstituencyProject(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Project item saved successfully'));
  });

  deleteConstituencyProject = asyncHandler(async (req, res) => {
    await contentService.deleteConstituencyProject(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Project item deleted successfully'));
  });

  // --- Blogs ---

  saveBlogPost = asyncHandler(async (req, res) => {
    const data = await contentService.saveBlogPost(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Blog post saved successfully'));
  });

  deleteBlogPost = asyncHandler(async (req, res) => {
    await contentService.deleteBlogPost(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Blog post deleted successfully'));
  });

  // --- Gallery ---

  saveGalleryItem = asyncHandler(async (req, res) => {
    const data = await contentService.saveGalleryItem(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Gallery item saved successfully'));
  });

  deleteGalleryItem = asyncHandler(async (req, res) => {
    await contentService.deleteGalleryItem(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Gallery item deleted successfully'));
  });

  // --- Contact Messages Inbox ---

  getMessages = asyncHandler(async (req, res) => {
    const data = await contentService.getContactMessages();
    return res.status(200).json(ApiResponse.success(data, 'Messages loaded successfully'));
  });

  // --- Report Cards ---

  saveReportCard = asyncHandler(async (req, res) => {
    const data = await contentService.saveReportCard(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Report card saved successfully'));
  });

  deleteReportCard = asyncHandler(async (req, res) => {
    await contentService.deleteReportCard(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Report card deleted successfully'));
  });

  // --- Contact Messages ---

  deleteMessage = asyncHandler(async (req, res) => {
    await contentService.deleteContactMessage(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Message deleted successfully'));
  });

  // --- Categories ---

  getCategories = asyncHandler(async (req, res) => {
    const data = await contentService.getCategories();
    return res.status(200).json(ApiResponse.success(data, 'Categories retrieved successfully'));
  });

  saveCategory = asyncHandler(async (req, res) => {
    const data = await contentService.saveCategory(req.body);
    return res.status(200).json(ApiResponse.success(data, 'Category saved successfully'));
  });

  deleteCategory = asyncHandler(async (req, res) => {
    await contentService.deleteCategory(req.params.id);
    return res.status(200).json(ApiResponse.success(null, 'Category deleted successfully'));
  });
}

module.exports = new AdminController();
