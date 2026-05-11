import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsListener } from './notifications.listener';
import { JwtAdapter } from 'src/adapters/jwt/jwt.dapter';
import { JsonwebtokenAdapter } from 'src/adapters/jwt/jsonwebtoken.dapter';

@Module({
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsListener,
    { provide: JwtAdapter, useClass: JsonwebtokenAdapter },
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
