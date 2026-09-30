import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * Basic health check endpoint — used by Docker health checks and load balancers.
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'stylework-backend',
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

export default router;
