import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import { PrismaClient } from 'src/generated/prisma/client';
import { prismaContext } from './prisma-context';

dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in .env file');
    }

    const adapter = new PrismaMariaDb(databaseUrl);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  get db(): PrismaClient {
    return prismaContext.getStore()?.prismaClient || this;
  }
}
