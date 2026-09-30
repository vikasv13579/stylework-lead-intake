import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from './__mocks__/prisma';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 with status ok when DB is reachable', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ '?column?': 1 }]);

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('stylework-backend');
    expect(res.body.checks.database.status).toBe('ok');
  });

  it('returns 503 with status degraded when DB is unreachable', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

    const res = await request(app).get('/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.checks.database.status).toBe('error');
  });
});
