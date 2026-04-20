import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { User } from 'src/auth/entities/user.entity';
import { MailerAdapter } from 'src/adapters/mailer/mailer.dapter';
import { confirmAccountTemplate } from './templates/confirmAccount.template';
import { DateManagerAdapter } from 'src/adapters/dateManager/dateManager.adapter';
import { resetPasswordTemplate } from './templates/resetPassword.template';

@Processor('mail_queue')
export class MailProcessor extends WorkerHost {
  constructor(
    private readonly mailerAdapter: MailerAdapter,
    private readonly dateManager: DateManagerAdapter,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const user = job.data?.user as User;
    const token = job.data?.token as string;

    switch (job.name) {
      case 'confirm_account':
        if (!user || !token) {
          throw new Error('Invalid job data');
        }

        await this.mailerAdapter.sendMail(
          user.email,
          'Confirm your account',
          confirmAccountTemplate({
            name: user.name,
            confirmationLink: `${process.env.APP_URL}/confirm-account/${token}`,
            expirationTime: user.expires_at
              ? this.dateManager.format(user.expires_at, 'dd/MM/yyyy HH:mm:ss')
              : '',

            companyName: 'Social Network',
            supportEmail: process.env.SUPPORT_EMAIL!,
          }),
        );

        return { sent: true };

      case 'reset_password':
        const expiresAt = job.data?.expiresAt as Date;

        if (!user || !token || !expiresAt) {
          throw new Error('Invalid job data');
        }

        this.mailerAdapter.sendMail(
          user.email,
          'Reset your password',
          resetPasswordTemplate({
            name: user.name,
            resetPasswordLink: `${process.env.APP_URL}/reset-password/${token}`,
            expirationTime: this.dateManager.format(
              expiresAt,
              'dd/MM/yyyy HH:mm:ss',
            ),

            companyName: 'Social Network',
            supportEmail: process.env.SUPPORT_EMAIL!,
          }),
        );
        return { sent: true };
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    job.log(`Job ${job.id} completed successfully!`);
  }
}
