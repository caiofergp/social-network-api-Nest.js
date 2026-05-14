import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsListener } from './notifications.listener';

@Module({
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsListener,
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
