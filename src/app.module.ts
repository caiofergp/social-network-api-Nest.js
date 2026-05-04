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
import { PostsModule } from './posts/posts.module';
import { StorageModule } from './storage/storage.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
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
        users: {
          [process.env.BULL_ADMIN_USER!]: process.env.BULL_ADMIN_PASSWORD!,
        },
        challenge: true,
      }),
    }),
    MailModule,
    FollowsModule,
    PostsModule,
    StorageModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
