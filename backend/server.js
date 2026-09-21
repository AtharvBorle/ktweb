const app = require('./src/app');
const config = require('./src/config/config');
const { logger } = require('./src/utils/helpers');

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`========================================================`);
  logger.info(` Kunal Tilak Official Website & CMS API Server Started!`);
  logger.info(` Environment: ${config.env}`);
  logger.info(` API Server:  http://localhost:${PORT}`);
  logger.info(` Web & Admin: http://localhost:${PORT}`);
  logger.info(`========================================================`);
});

// Process Error Handlers
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`, err.stack);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, err.stack);
  process.exit(1);
});

// Graceful Shutdown
const shutdown = () => {
  logger.info('Shutting down API server gracefully...');
  server.close(() => {
    logger.info('Server process closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
