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
import { MailModule } from 'src/mail/mail.module';
import { DateManagerAdapter } from '../adapters/date-manager/date-manager.adapter';
import { DateFnsAdapter } from '../adapters/date-manager/date-fns.adapter';
import { AuthCleanupService } from './auth-cleanup.service';
import { AuthCleanupProcessor } from './auth-cleanup.processor';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { PrismaPasswordResetTokenRepository } from './repositories/prisma/prisma-password-reset-token.repository';
import { JwtModule } from '@nestjs/jwt';

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
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCleanupService,
    AuthCleanupProcessor,
    { provide: AuthRepository, useClass: PrismaAuthRepository },
    {
      provide: PasswordResetTokenRepository,
      useClass: PrismaPasswordResetTokenRepository,
    },
    { provide: HashAdapter, useClass: BcryptAdapter },
    { provide: DateManagerAdapter, useClass: DateFnsAdapter },
  ],
  exports: [
    { provide: AuthRepository, useClass: PrismaAuthRepository },
    {
      provide: PasswordResetTokenRepository,
      useClass: PrismaPasswordResetTokenRepository,
    },
    JwtModule,
  ],
})
export class AuthModule {}
