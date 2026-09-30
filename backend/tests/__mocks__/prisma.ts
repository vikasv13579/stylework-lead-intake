import { LeadStatus } from '@prisma/client';

/**
 * Jest mock for src/lib/prisma.ts
 * Resolved via moduleNameMapper — no real DB connection in tests.
 */
export const mockActivity = {
  id: 'act-1',
  leadId: 'lead-1',
  action: 'Lead Created',
  previousValue: null,
  newValue: {},
  metadata: null,
  createdAt: new Date('2026-09-30T10:00:00Z'),
};

export const mockLead = {
  id: 'lead-1',
  externalLeadId: 'ext-001',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  phone: '+1234567890',
  source: 'META_ADS',
  status: LeadStatus.NEW,
  campaignId: null,
  adId: null,
  createdAt: new Date('2026-09-30T10:00:00Z'),
  updatedAt: new Date('2026-09-30T10:00:00Z'),
  activities: [mockActivity],
};

export const prisma = {
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn().mockImplementation(async (arg: any) => {
    if (typeof arg === 'function') {
      return arg(prisma);
    }
    return Promise.all(arg);
  }),
  lead: {
    findMany: jest.fn().mockResolvedValue([mockLead]),
    count: jest.fn().mockResolvedValue(1),
    findUnique: jest.fn().mockResolvedValue(mockLead),
    findUniqueOrThrow: jest.fn().mockResolvedValue(mockLead),
    create: jest.fn().mockResolvedValue(mockLead),
    update: jest.fn().mockResolvedValue(mockLead),
    delete: jest.fn().mockResolvedValue(mockLead),
  },
  activity: {
    create: jest.fn().mockResolvedValue(mockActivity),
  },
};

export const disconnectPrisma = jest.fn().mockResolvedValue(undefined);
