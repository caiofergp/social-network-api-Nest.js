import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail_queue') private readonly mailQueue: Queue) {}

  async sendConfirmAccountEmail(user: User, token: string) {
    await this.mailQueue.add(
      'confirm_account',
      { user, token },
      {
        attempts: 3,
        backoff: 1000,
        priority: 0,
        delay: Math.random() * 10000,
      },
    );
  }

  async sendResetPasswordEmail(user: User, token: string, expiresAt: Date) {
    await this.mailQueue.add(
      'reset_password',
      { user, token, expiresAt },
      {
        attempts: 3,
        backoff: 1000,
        priority: 0,
        delay: Math.random() * 10000,
      },
    );
  }
}
