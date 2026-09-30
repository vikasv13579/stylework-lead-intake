import { createApp } from './app';
import { config } from './config/env';
import logger from './config/logger';
import { disconnectPrisma } from './lib/prisma';

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info(`🚀 Backend server started`, {
    port: config.PORT,
    env: config.NODE_ENV,
    cors: config.CORS_ORIGIN,
  });
});

// Graceful shutdown
const shutdown = (signal: string): void => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    void disconnectPrisma().then(() => process.exit(0));
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled promise rejection', { reason });
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});
