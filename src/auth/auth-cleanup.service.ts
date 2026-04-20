import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AuthCleanupService {
  private readonly logger = new Logger(AuthCleanupService.name);

  constructor(
    @InjectQueue('auth_cleanup_queue') private readonly authCleanupQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Scheduling cleanup of unverified users via queue...');

    try {
      await this.authCleanupQueue.add('delete_unverified_users', {});

      this.logger.log('Cleanup job added to queue successfully.');
    } catch (error) {
      this.logger.error('Failed to add cleanup job to queue', error);
    }
  }
}
