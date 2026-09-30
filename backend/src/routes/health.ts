import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import logger from '../config/logger';

const router = Router();

/**
 * GET /health
 * Returns service status, version, and database connectivity.
 * Used by Docker health checks and load balancers.
 */
router.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();

  let dbStatus: 'ok' | 'error' = 'ok';
  let dbLatencyMs: number | null = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'error';
    logger.warn('Health check: database unreachable', { error });
  }

  const isHealthy = dbStatus === 'ok';

  const responseBody = {
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'stylework-backend',
    version: process.env.npm_package_version ?? '1.0.0',
    uptime: Math.floor(process.uptime()),
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
    responseTimeMs: Date.now() - startTime,
  };

  // Return 200 even when DB is down — let the consumer decide;
  // return 503 only if the service itself is critically broken
  res.status(isHealthy ? 200 : 503).json(responseBody);
});

export default router;
