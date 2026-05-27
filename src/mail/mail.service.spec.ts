import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { User } from 'src/users/entities/user.entity';

describe('MailService', () => {
  let service: MailService;
  let mailQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: getQueueToken('mail_queue'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailQueue = module.get(getQueueToken('mail_queue'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendConfirmAccountEmail', () => {
    it('should add a job to the mail queue', async () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test' };
      const token = 'token';

      await service.sendConfirmAccountEmail(user as User, token);

      expect(mailQueue.add).toHaveBeenCalledWith(
        'confirm_account',
        { user, token },
        expect.any(Object),
      );
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should add a job to the mail queue', async () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test' };
      const token = 'token';
      const expiresAt = new Date();

      await service.sendResetPasswordEmail(user as User, token, expiresAt);

      expect(mailQueue.add).toHaveBeenCalledWith(
        'reset_password',
        { user, token, expiresAt },
        expect.any(Object),
      );
    });
  });
});
