import { Request, Response, NextFunction } from 'express';
import { MetaWebhookPayloadSchema } from '../validators/webhook.validator';
import { processMetaWebhook } from '../services/webhook.service';
import logger from '../config/logger';

/**
 * POST /webhook/meta-lead
 *
 * Receives a Meta Ads lead webhook, validates it, and processes it.
 * Idempotent — sending the same leadgen_id multiple times is safe.
 */
export async function handleMetaWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug('Received Meta webhook', { body: req.body });

    // Validate the incoming payload with Zod
    const parsed = MetaWebhookPayloadSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid webhook payload',
          details: parsed.error.flatten().fieldErrors,
        },
      });
      return;
    }

    const result = await processMetaWebhook(parsed.data);

    if (result.created) {
      res.status(201).json({
        message: 'Lead created successfully',
        data: result.lead,
      });
    } else {
      // Idempotent: same lead received again, 200 not 201
      res.status(200).json({
        message: 'Lead already exists (duplicate webhook)',
        data: result.lead,
      });
    }
  } catch (error) {
    next(error);
  }
}
