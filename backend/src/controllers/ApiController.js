const contentService = require('../services/ContentService');
const { ApiResponse, asyncHandler } = require('../utils/helpers');

/**
 * OOP Public API Controller
 */
class ApiController {
  /**
   * GET /api/content
   */
  getContent = asyncHandler(async (req, res) => {
    const content = await contentService.getFullContent();
    return res.status(200).json(ApiResponse.success(content, 'Content loaded successfully'));
  });

  /**
   * POST /api/contact
   */
  submitContact = asyncHandler(async (req, res) => {
    const saved = await contentService.submitContactMessage(req.body);
    return res.status(201).json(ApiResponse.created(saved, 'Thank you! Your message has been sent successfully.'));
  });
}

module.exports = new ApiController();
