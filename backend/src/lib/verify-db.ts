/**
 * verify-db.ts
 * Quick connectivity check — run with: ts-node src/lib/verify-db.ts
 */
import { prisma } from './prisma';
import logger from '../config/logger';

async function verify(): Promise<void> {
  try {
    logger.info('Checking database connection...');
    const result = await prisma.$queryRaw<[{ now: Date }]>`SELECT NOW() as now`;
    logger.info('✅ Database connected', { serverTime: result[0].now });

    const leadCount = await prisma.lead.count();
    const activityCount = await prisma.activity.count();
    logger.info('Table counts', { leads: leadCount, activities: activityCount });
  } catch (error) {
    logger.error('❌ Database connection failed', { error });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void verify();
