import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaAuthRepository } from './repositories/prisma/prisma-auth.repository';
import { AuthRepository } from './repositories/auth.repository';
import { HashAdapter } from '../adapters/hash/hash.adapter';
import { BcryptAdapter } from '../adapters/hash/bcrypt.adapter';
import { JwtAdapter } from 'src/adapters/jwt/jwt.dapter';
import { JsonwebtokenAdapter } from 'src/adapters/jwt/jsonwebtoken.dapter';
import { MailModule } from 'src/mail/mail.module';
import { DateManagerAdapter } from 'src/adapters/dateManager/dateManager.adapter';
import { DateFnsAdapter } from 'src/adapters/dateManager/dateFns.adapter';
import { AuthCleanupService } from './auth-cleanup.service';
import { AuthCleanupProcessor } from './auth-cleanup.processor';

@Module({
  imports: [
    MailModule,
    BullModule.registerQueue({
      name: 'auth_cleanup_queue',
    }),
    BullBoardModule.forFeature({
      name: 'auth_cleanup_queue',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCleanupService,
    AuthCleanupProcessor,
    { provide: AuthRepository, useClass: PrismaAuthRepository },
    { provide: HashAdapter, useClass: BcryptAdapter },
    { provide: JwtAdapter, useClass: JsonwebtokenAdapter },
    { provide: DateManagerAdapter, useClass: DateFnsAdapter },
  ],
})
export class AuthModule {}

