import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullModule } from '@nestjs/bullmq';
import { MailerAdapter } from 'src/adapters/mailer/mailer.dapter';
import { NodemailerAdapter } from 'src/adapters/mailer/nodemailer.adapter';
import { DateManagerAdapter } from 'src/adapters/dateManager/dateManager.adapter';
import { DateFnsAdapter } from 'src/adapters/dateManager/dateFns.adapter';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail_queue',
    }),
    BullBoardModule.forFeature({
      name: 'mail_queue',
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    MailService,
    MailProcessor,
    { provide: MailerAdapter, useClass: NodemailerAdapter },
    { provide: DateManagerAdapter, useClass: DateFnsAdapter },
  ],
  exports: [MailService],
})
export class MailModule {}
