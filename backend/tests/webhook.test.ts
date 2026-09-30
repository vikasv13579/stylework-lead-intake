import {
  MetaWebhookPayloadSchema,
  normalizeMetaPayload,
} from '../src/validators/webhook.validator';

describe('Meta Webhook Validator & Normalizer', () => {
  it('validates a correct Meta Ads webhook payload', () => {
    const rawPayload = {
      leadgen_id: '1234567890',
      created_time: '2026-09-30T10:00:00Z',
      campaign_id: 'camp_001',
      ad_id: 'ad_001',
      field_data: [
        { name: 'full_name', values: ['Jane Doe'] },
        { name: 'email', values: ['jane.doe@example.com'] },
        { name: 'phone_number', values: ['+1234567890'] },
      ],
    };

    const parsed = MetaWebhookPayloadSchema.safeParse(rawPayload);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      const normalized = normalizeMetaPayload(parsed.data);
      expect(normalized.externalLeadId).toBe('1234567890');
      expect(normalized.firstName).toBe('Jane');
      expect(normalized.lastName).toBe('Doe');
      expect(normalized.email).toBe('jane.doe@example.com');
      expect(normalized.phone).toBe('+1234567890');
      expect(normalized.source).toBe('META_ADS');
    }
  });

  it('rejects invalid payload missing leadgen_id', () => {
    const rawPayload = {
      field_data: [{ name: 'email', values: ['test@example.com'] }],
    };

    const parsed = MetaWebhookPayloadSchema.safeParse(rawPayload);
    expect(parsed.success).toBe(false);
  });
});
