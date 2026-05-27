import { Test, TestingModule } from '@nestjs/testing';
import { FollowsService } from './follows.service';
import { FollowRepository } from './repositories/follow.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/auth/entities/user.entity';
import { PrismaErrorCode } from 'src/db/prisma/prisma-error-code';
import { BadRequestException } from '@nestjs/common';
import { BaseNotificationPayload } from 'src/notifications/notifications.listener';

describe('FollowsService', () => {
  let service: FollowsService;
  let followRepository: jest.Mocked<FollowRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockUser: User = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password',
    token: null,
    expires_at: null,
  } as User;

  const mockFollow = {
    id: 'follow-1',
    follower_id: 'user-1',
    following_id: 'user-2',
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        {
          provide: FollowRepository,
          useValue: {
            create: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
    followRepository = module.get(FollowRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('follow', () => {
    it('should create a follow and emit an event', async () => {
      followRepository.create.mockResolvedValue(mockFollow);

      const result = await service.follow(mockUser, 'user-2');

      expect(result).toEqual(mockFollow);
      expect(followRepository.create).toHaveBeenCalledWith('user-1', 'user-2');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'follow.created',
        expect.any(BaseNotificationPayload),
      );
    });

    it('should throw BadRequestException if already following', async () => {
      followRepository.create.mockRejectedValue({
        code: PrismaErrorCode.uniqueConstraint,
      });

      await expect(service.follow(mockUser, 'user-2')).rejects.toThrow(
        new BadRequestException('You are already following this user'),
      );
    });

    it('should throw BadRequestException if user does not exist', async () => {
      followRepository.create.mockRejectedValue({
        code: PrismaErrorCode.foreignKey,
      });

      await expect(service.follow(mockUser, 'user-2')).rejects.toThrow(
        new BadRequestException('User does not exist'),
      );
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Some other error');
      followRepository.create.mockRejectedValue(error);

      await expect(service.follow(mockUser, 'user-2')).rejects.toThrow(error);
    });
  });

  describe('unfollow', () => {
    it('should delete a follow', async () => {
      followRepository.delete.mockResolvedValue(undefined);

      const result = await service.unfollow('user-2');

      expect(result).toBeUndefined();
      expect(followRepository.delete).toHaveBeenCalledWith('user-2');
    });

    it('should throw BadRequestException if not following', async () => {
      followRepository.delete.mockRejectedValue({
        code: PrismaErrorCode.notFound,
      });

      await expect(service.unfollow('user-2')).rejects.toThrow(
        new BadRequestException('You are not following this user'),
      );
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Some other error');
      followRepository.delete.mockRejectedValue(error);

      await expect(service.unfollow('user-2')).rejects.toThrow(error);
    });
  });

  describe('getFollowers', () => {
    it('should return followers for a user', async () => {
      followRepository.findMany.mockResolvedValue([mockFollow]);

      const result = await service.getFollowers('user-1');

      expect(result).toEqual([mockFollow]);
      expect(followRepository.findMany).toHaveBeenCalledWith({
        following_id: 'user-1',
      });
    });
  });

  describe('getFollowing', () => {
    it('should return following for a user', async () => {
      followRepository.findMany.mockResolvedValue([mockFollow]);

      const result = await service.getFollowing('user-1');

      expect(result).toEqual([mockFollow]);
      expect(followRepository.findMany).toHaveBeenCalledWith({
        follower_id: 'user-1',
      });
    });
  });
});
