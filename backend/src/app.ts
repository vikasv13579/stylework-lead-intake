import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';
import webhookRouter from './routes/webhook';
import leadRouter from './routes/lead';
import logger from './config/logger';

export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Request body parsing with size limit
  app.use(express.json({ limit: config.REQUEST_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: config.REQUEST_LIMIT }));

  // HTTP request logging
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );

  // Routes
  app.use('/health', healthRouter);
  app.use('/webhook', webhookRouter);
  app.use('/api/leads', leadRouter);

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
}
