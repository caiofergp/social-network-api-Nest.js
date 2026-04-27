import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { prismaContext } from './prisma-context';
import { UnitOfWork } from '../unit-of-work';
import { randomUUID } from 'crypto';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  private readonly logger = new Logger(PrismaUnitOfWork.name);

  constructor(private readonly prisma: PrismaService) {}

  async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const txId = randomUUID();
    this.logger.log(`[Transaction-${txId}] Starting transaction`);
    const startTime = Date.now();

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        return await prismaContext.run({ txId, prismaClient: tx as any }, fn);
      });

      const duration = Date.now() - startTime;

      this.logger.log(
        `[Transaction-${txId}] Transaction committed successfully in ${duration}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `[Transaction-${txId}] Transaction failed: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
