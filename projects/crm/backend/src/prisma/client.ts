// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');

// Singleton PrismaClient instance.
// In development, reuse the instance across hot-reloads to avoid exhausting
// the connection pool (tsx watch creates new module instances).

type PrismaClientType = InstanceType<typeof PrismaClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  __prisma?: PrismaClientType;
};

function createPrismaClient(): PrismaClientType {
  return new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });
}

export const prisma: PrismaClientType =
  globalForPrisma.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.__prisma = prisma;
}
