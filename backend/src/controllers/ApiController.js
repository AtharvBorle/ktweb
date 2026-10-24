const contentService = require('../services/ContentService');
const { ApiResponse, asyncHandler } = require('../utils/helpers');

/**
 * OOP Public API Controller
 */
class ApiController {
  /**
   * GET /api/content
   */
  /**
   * GET /health-check & /api/health-check
   * Enterprise Health & Liveness Probe Endpoint
   */
  healthCheck = asyncHandler(async (req, res) => {
    const memory = process.memoryUsage();
    const formatMB = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

    const uptimeSeconds = Math.floor(process.uptime());
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeFormatted = `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

    let storageStatus = { status: 'healthy', provider: 'local_store' };
    try {
      const isStoreAccessible = contentService.isStorageHealthy();
      if (!isStoreAccessible) {
        storageStatus = { status: 'degraded', provider: 'local_store', message: 'Storage file is not writable or missing' };
      }
    } catch (e) {
      storageStatus = { status: 'unhealthy', error: e.message };
    }

    const isHealthy = storageStatus.status !== 'unhealthy';
    const healthPayload = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'Kunal Tilak CMS & API Server',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      uptimeFormatted,
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0',
      memory: {
        rss: formatMB(memory.rss),
        heapTotal: formatMB(memory.heapTotal),
        heapUsed: formatMB(memory.heapUsed)
      },
      storage: storageStatus
    };

    const httpCode = isHealthy ? 200 : 503;
    return res.status(httpCode).json(ApiResponse.success(healthPayload, isHealthy ? 'Server is healthy and operational' : 'Server is experiencing degradation'));
  });

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
