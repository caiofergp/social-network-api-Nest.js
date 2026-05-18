import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { HashAdapter } from '../adapters/hash/hash.adapter';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { DateManagerAdapter } from 'src/adapters/date-manager/date-manager.adapter';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: {} },
        { provide: PasswordResetTokenRepository, useValue: {} },
        { provide: HashAdapter, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: DateManagerAdapter, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
