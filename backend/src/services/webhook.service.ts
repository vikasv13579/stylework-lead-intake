import {
  MetaWebhookPayload,
  normalizeMetaPayload,
} from '../validators/webhook.validator';
import {
  createLeadWithActivity,
  findLeadByExternalId,
  findLeadById,
  LeadWithActivities,
} from '../repositories/lead.repository';
import { Errors } from '../types/errors';
import logger from '../config/logger';

export interface WebhookResult {
  lead: LeadWithActivities;
  created: boolean; // false = idempotent duplicate, already existed
}

/**
 * Processes an incoming Meta Ads webhook.
 *
 * Implements idempotency: if the same leadgen_id is received again,
 * the existing lead is returned without creating a duplicate.
 *
 * Uses a DB transaction to ensure atomic lead + audit creation.
 */
export async function processMetaWebhook(
  payload: MetaWebhookPayload
): Promise<WebhookResult> {
  // Normalize the raw Meta payload into structured data
  const leadData = normalizeMetaPayload(payload);

  logger.info('Processing Meta webhook', {
    externalLeadId: leadData.externalLeadId,
    email: leadData.email,
  });

  // Idempotency check — has this leadgen_id been seen before?
  const existing = await findLeadByExternalId(leadData.externalLeadId);

  if (existing) {
    logger.info('Duplicate webhook detected — returning existing lead', {
      externalLeadId: leadData.externalLeadId,
      existingId: existing.id,
    });

    const full = await findLeadById(existing.id);
    if (!full) throw Errors.InternalError();

    return { lead: full, created: false };
  }

  // Create the lead + audit activity in a single transaction
  const lead = await createLeadWithActivity(
    {
      externalLeadId: leadData.externalLeadId,
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      source: leadData.source,
      campaignId: leadData.campaignId,
      adId: leadData.adId,
    },
    {
      source: 'META_ADS_WEBHOOK',
      originalPayload: {
        leadgen_id: payload.leadgen_id,
        created_time: payload.created_time ?? null,
      },
    }
  );

  logger.info('Lead created from webhook', {
    leadId: lead.id,
    externalLeadId: lead.externalLeadId,
    email: lead.email,
  });

  return { lead, created: true };
}
