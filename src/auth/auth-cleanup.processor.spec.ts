import { Test, TestingModule } from '@nestjs/testing';
import { AuthCleanupProcessor } from './auth-cleanup.processor';
import { AuthRepository } from './repositories/auth.repository';
import { getQueueToken } from '@nestjs/bullmq';
import { Job } from 'bullmq';

describe('AuthCleanupProcessor', () => {
  let processor: AuthCleanupProcessor;
  let authRepository: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthCleanupProcessor,
        {
          provide: AuthRepository,
          useValue: {
            deleteUnverifiedUsersWithExpiredTokens: jest.fn(),
          },
        },
        {
          provide: getQueueToken('auth_cleanup_queue'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<AuthCleanupProcessor>(AuthCleanupProcessor);
    authRepository = module.get(AuthRepository);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process delete_unverified_users job', async () => {
      authRepository.deleteUnverifiedUsersWithExpiredTokens.mockResolvedValue(10);
      const job = {
        name: 'delete_unverified_users',
        log: jest.fn(),
      } as unknown as Job;

      const result = await processor.process(job);

      expect(result).toEqual({ deletedCount: 10 });
      expect(authRepository.deleteUnverifiedUsersWithExpiredTokens).toHaveBeenCalledWith(1000);
    });

    it('should log unknown job type', async () => {
      const job = {
        name: 'unknown_job',
        log: jest.fn(),
      } as unknown as Job;

      await processor.process(job);

      expect(job.log).toHaveBeenCalledWith('Unknown job type: unknown_job');
    });
  });
});
