import { PrismaClient } from "@prisma/client";

/**
 * Lazy Prisma singleton. Mock-first: in USE_MOCKS mode the repository layer
 * never touches this, so no client is instantiated and no DB connection is
 * made. The client is created on first access and reused across hot reloads.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let client: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!client) {
    client = globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
  }
  return client;
}
