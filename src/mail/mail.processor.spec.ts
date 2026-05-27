import { Test, TestingModule } from '@nestjs/testing';
import { MailProcessor } from './mail.processor';
import { MailerAdapter } from 'src/adapters/mailer/mailer.adapter';
import { DateManagerAdapter } from 'src/adapters/date-manager/date-manager.adapter';
import { Job } from 'bullmq';

describe('MailProcessor', () => {
  let processor: MailProcessor;
  let mailerAdapter: jest.Mocked<MailerAdapter>;
  let dateManager: jest.Mocked<DateManagerAdapter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailProcessor,
        {
          provide: MailerAdapter,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: DateManagerAdapter,
          useValue: {
            format: jest.fn().mockReturnValue('formatted-date'),
          },
        },
      ],
    }).compile();

    processor = module.get<MailProcessor>(MailProcessor);
    mailerAdapter = module.get(MailerAdapter);
    dateManager = module.get(DateManagerAdapter);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process confirm_account job', async () => {
      const job = {
        name: 'confirm_account',
        data: {
          user: { email: 'test@example.com', name: 'Test', expires_at: new Date() },
          token: 'token',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result).toEqual({ sent: true });
      expect(mailerAdapter.sendMail).toHaveBeenCalledWith(
        'test@example.com',
        'Confirm your account',
        expect.any(String),
      );
    });

    it('should process reset_password job', async () => {
      const job = {
        name: 'reset_password',
        data: {
          user: { email: 'test@example.com', name: 'Test' },
          token: 'token',
          expiresAt: new Date(),
        },
      } as Job;

      const result = await processor.process(job);

      expect(result).toEqual({ sent: true });
      expect(mailerAdapter.sendMail).toHaveBeenCalledWith(
        'test@example.com',
        'Reset your password',
        expect.any(String),
      );
    });

    it('should throw error if job data is invalid', async () => {
      const job = {
        name: 'confirm_account',
        data: {},
      } as Job;

      await expect(processor.process(job)).rejects.toThrow('Invalid job data');
    });
  });
});
