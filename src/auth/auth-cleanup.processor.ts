import {
  Processor,
  WorkerHost,
  OnWorkerEvent,
  InjectQueue,
} from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { AuthRepository } from './repositories/auth.repository';

@Processor('auth_cleanup_queue')
export class AuthCleanupProcessor extends WorkerHost {
  constructor(
    private readonly authRepository: AuthRepository,
    @InjectQueue('auth_cleanup_queue') private readonly authCleanupQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'delete_unverified_users':
        return await this.handleDeleteUnverifiedUsers(job);
      default:
        job.log(`Unknown job type: ${job.name}`);
    }
  }

  private async handleDeleteUnverifiedUsers(job: Job) {
    const LIMIT = 1000;

    const startMsg = `Starting deletion of unverified users with expired tokens (limit: ${LIMIT})...`;
    job.log(startMsg);

    try {
      const deletedCount =
        await this.authRepository.deleteUnverifiedUsersWithExpiredTokens(LIMIT);

      job.log(`Cleanup batch finished. Deleted ${deletedCount} users.`);

      return { deletedCount };
    } catch (error) {
      job.log('Error during unverified users deletion');

      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    job.log(`Cleanup job ${job.id} completed successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    job.log(`Cleanup job ${job.id} failed: ${error.message}`);
  }
}
