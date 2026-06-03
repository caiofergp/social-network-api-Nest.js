import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { clearDatabase } from './seeder/main';

config({ path: resolve(__dirname, '../../.env.test') });

export default async () => {
  const prisma = new PrismaClient({
    adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
  });

  try {
    await clearDatabase(prisma);
  } finally {
    await prisma.$disconnect();
  }
};
