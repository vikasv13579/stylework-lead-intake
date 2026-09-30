import { PrismaClient, LeadStatus } from '@prisma/client';

/**
 * Manual Prisma mock — replaces src/lib/prisma.ts in tests.
 * All methods are jest.fn() so tests can configure them per-case.
 */
const mockActivity = {
  id: 'act-1',
  leadId: 'lead-1',
  action: 'Lead Created',
  previousValue: null,
  newValue: {},
  metadata: null,
  createdAt: new Date('2026-09-30T10:00:00Z'),
};

const mockLead = {
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

const prismaMock: Partial<PrismaClient> = {
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn().mockImplementation(async (arg: any) => {
    if (typeof arg === 'function') {
      return arg(prismaMock);
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
  } as any,
  activity: {
    create: jest.fn().mockResolvedValue(mockActivity),
  } as any,
};

jest.mock('../src/lib/prisma', () => ({
  prisma: prismaMock,
  disconnectPrisma: jest.fn(),
}));

export { prismaMock, mockLead, mockActivity };
