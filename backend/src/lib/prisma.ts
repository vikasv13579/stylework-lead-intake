import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';
import logger from '../config/logger';

/**
 * Singleton Prisma client.
 * In development, we re-use the client across hot-reloads to avoid exhausting connections.
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      config.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' },
          ]
        : [
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' },
          ],
  });
}

export const prisma: PrismaClient =
  global.__prisma ??
  (() => {
    const client = createPrismaClient();

    // Forward Prisma log events to Winston
    // @ts-expect-error — Prisma event typing is complex
    client.$on('query', (e: { query: string; duration: number }) => {
      logger.debug('Prisma query', { query: e.query, duration: `${e.duration}ms` });
    });

    // @ts-expect-error — Prisma event typing is complex
    client.$on('warn', (e: { message: string }) => {
      logger.warn('Prisma warning', { message: e.message });
    });

    // @ts-expect-error — Prisma event typing is complex
    client.$on('error', (e: { message: string }) => {
      logger.error('Prisma error', { message: e.message });
    });

    if (config.NODE_ENV === 'development') {
      global.__prisma = client;
    }

    return client;
  })();

/**
 * Gracefully disconnect Prisma — call this on server shutdown.
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
}
