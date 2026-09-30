import request from 'supertest';
import { createApp } from '../src/app';
import { prisma, mockLead } from './__mocks__/prisma';
import { LeadStatus } from '@prisma/client';

const app = createApp();

const VALID_WEBHOOK = {
  leadgen_id: 'ext-001',
  created_time: '2026-09-30T10:00:00Z',
  campaign_id: 'camp-1',
  field_data: [
    { name: 'first_name',    values: ['Jane'] },
    { name: 'last_name',     values: ['Doe'] },
    { name: 'email',         values: ['jane.doe@example.com'] },
    { name: 'phone_number',  values: ['+1234567890'] },
  ],
};

// ── Webhook ────────────────────────────────────────────────────────────────
describe('POST /webhook/meta-lead', () => {
  it('creates a new lead from a valid Meta webhook (201)', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const res = await request(app).post('/webhook/meta-lead').send(VALID_WEBHOOK);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/created/i);
    expect(res.body.data.email).toBe('jane.doe@example.com');
  });

  it('returns 200 (idempotent) when the same leadgen_id is replayed', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValueOnce(mockLead);

    const res = await request(app).post('/webhook/meta-lead').send(VALID_WEBHOOK);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/duplicate/i);
  });

  it('returns 400 for a missing leadgen_id', async () => {
    const res = await request(app)
      .post('/webhook/meta-lead')
      .send({ field_data: [{ name: 'email', values: ['x@x.com'] }] });
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty field_data', async () => {
    const res = await request(app)
      .post('/webhook/meta-lead')
      .send({ leadgen_id: 'abc', field_data: [] });
    expect(res.status).toBe(400);
  });
});

// ── List leads ─────────────────────────────────────────────────────────────
describe('GET /api/leads', () => {
  it('returns a paginated list (200)', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValueOnce([[mockLead], 1]);
    (prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead);

    const res = await request(app).get('/api/leads');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination.total).toBe(1);
  });

  it('accepts page and limit query params', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValueOnce([[mockLead], 1]);
    (prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead);

    const res = await request(app).get('/api/leads?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('returns 400 if limit exceeds 100', async () => {
    const res = await request(app).get('/api/leads?limit=200');
    expect(res.status).toBe(400);
  });
});

// ── Get single lead ────────────────────────────────────────────────────────
describe('GET /api/leads/:id', () => {
  it('returns 200 with lead detail', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValueOnce(mockLead);

    const res = await request(app).get('/api/leads/lead-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('lead-1');
  });

  it('returns 404 for unknown id', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const res = await request(app).get('/api/leads/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('LEAD_NOT_FOUND');
  });
});

// ── Create lead ────────────────────────────────────────────────────────────
describe('POST /api/leads', () => {
  it('creates a lead manually (201)', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead);

    const res = await request(app)
      .post('/api/leads')
      .send({ firstName: 'John', lastName: 'Smith', email: 'john@example.com' });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/created/i);
  });

  it('returns 400 for missing email', async () => {
    const res = await request(app)
      .post('/api/leads')
      .send({ firstName: 'John', lastName: 'Smith' });
    expect(res.status).toBe(400);
  });
});

// ── Status transition ──────────────────────────────────────────────────────
describe('PATCH /api/leads/:id/status', () => {
  it('transitions NEW → CONTACTED (200)', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValue({ ...mockLead, status: LeadStatus.NEW });

    const res = await request(app)
      .patch('/api/leads/lead-1/status')
      .send({ status: 'CONTACTED' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/CONTACTED/);
  });

  it('returns 422 for invalid transition NEW → CONVERTED', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValue({ ...mockLead, status: LeadStatus.NEW });

    const res = await request(app)
      .patch('/api/leads/lead-1/status')
      .send({ status: 'CONVERTED' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it('returns 400 for an unknown status value', async () => {
    const res = await request(app)
      .patch('/api/leads/lead-1/status')
      .send({ status: 'FOOBAR' });
    expect(res.status).toBe(400);
  });
});

// ── Delete lead ────────────────────────────────────────────────────────────
describe('DELETE /api/leads/:id', () => {
  it('deletes an existing lead (200)', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValueOnce(mockLead);
    (prisma.lead.delete as jest.Mock).mockResolvedValueOnce(mockLead);

    const res = await request(app).delete('/api/leads/lead-1');

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('returns 404 when deleting non-existent lead', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const res = await request(app).delete('/api/leads/ghost');

    expect(res.status).toBe(404);
  });
});

// ── Activity log ───────────────────────────────────────────────────────────
describe('POST /api/leads/:id/activities', () => {
  it('logs a custom activity (201)', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead);

    const res = await request(app)
      .post('/api/leads/lead-1/activities')
      .send({ action: 'Call Logged', metadata: { duration: '5min' } });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/activity/i);
  });

  it('returns 400 when action is missing', async () => {
    const res = await request(app)
      .post('/api/leads/lead-1/activities')
      .send({});
    expect(res.status).toBe(400);
  });
});
