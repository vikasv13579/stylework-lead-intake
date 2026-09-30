import { Router } from 'express';
import { handleMetaWebhook } from '../controllers/webhook.controller';

const router = Router();

/**
 * POST /webhook/meta-lead
 *
 * Accepts Meta Ads lead webhook payloads.
 * Idempotent — safe to retry.
 *
 * Webhook authenticity: in production, Meta signs each request with
 * an X-Hub-Signature-256 HMAC header. The middleware is structured
 * so real verification can be added via META_APP_SECRET env var.
 * Not implemented here as actual Meta credentials are unavailable.
 */
router.post('/meta-lead', handleMetaWebhook);

export default router;
