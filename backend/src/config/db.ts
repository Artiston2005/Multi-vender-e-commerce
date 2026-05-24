import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  // Using adapter or standard connection as required by Prisma 7+ with prisma.config.ts
});
