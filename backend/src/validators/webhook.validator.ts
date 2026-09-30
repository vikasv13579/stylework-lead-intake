import { z } from 'zod';

/**
 * Zod schema for the Meta Ads webhook payload.
 * Based on the Meta Lead Ads API format.
 */

const FieldDataItemSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string()).min(1),
});

export const MetaWebhookPayloadSchema = z.object({
  leadgen_id: z.string().min(1, 'leadgen_id is required'),
  created_time: z.string().optional(),
  campaign_id: z.string().optional(),
  ad_id: z.string().optional(),
  form_id: z.string().optional(),
  page_id: z.string().optional(),
  field_data: z
    .array(FieldDataItemSchema)
    .min(1, 'field_data must contain at least one entry'),
});

export type MetaWebhookPayload = z.infer<typeof MetaWebhookPayloadSchema>;

/**
 * Extracts a field value from Meta's field_data array by field name.
 * Returns undefined if the field is not present.
 */
export function extractField(
  fieldData: MetaWebhookPayload['field_data'],
  name: string
): string | undefined {
  const field = fieldData.find((f) => f.name === name);
  return field?.values[0];
}

/**
 * Normalize the raw Meta payload into structured lead data.
 * Handles the various field name conventions Meta uses.
 */
export function normalizeMetaPayload(payload: MetaWebhookPayload): {
  externalLeadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | undefined;
  source: string;
  campaignId: string | undefined;
  adId: string | undefined;
} {
  const { field_data } = payload;

  const firstName =
    extractField(field_data, 'first_name') ??
    extractField(field_data, 'full_name')?.split(' ')[0] ??
    '';

  const lastName =
    extractField(field_data, 'last_name') ??
    extractField(field_data, 'full_name')?.split(' ').slice(1).join(' ') ??
    '';

  const email = extractField(field_data, 'email') ?? '';

  const phone =
    extractField(field_data, 'phone_number') ??
    extractField(field_data, 'phone') ??
    extractField(field_data, 'mobile_number');

  if (!email) {
    throw new Error('Email is required in webhook payload');
  }

  return {
    externalLeadId: payload.leadgen_id,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim(),
    source: 'META_ADS',
    campaignId: payload.campaign_id,
    adId: payload.ad_id,
  };
}
