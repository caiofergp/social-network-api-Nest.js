import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './db/prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { MailModule } from './mail/mail.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';
import { ScheduleModule } from '@nestjs/schedule';
import { FollowsModule } from './follows/follows.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    BullModule.forRoot({
      connection: {
        host: process.env.BULL_HOST,
        port: Number(process.env.BULL_PORT),
      },
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
      middleware: basicAuth({
        users: { [process.env.BULL_ADMIN_USER!]: process.env.BULL_ADMIN_PASSWORD! },
        challenge: true,
      })
    }),
    MailModule,
    FollowsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
