import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { UnitOfWork } from 'src/db/unit-of-work';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  let unitOfWork: jest.Mocked<UnitOfWork>;
  let storageAdapter: jest.Mocked<StorageAdapter>;
  let mediaRepository: jest.Mocked<MediaRepository>;

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar_id: null,
    cover_id: null,
    avatar: null,
    cover: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            getUserById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: UnitOfWork,
          useValue: {
            runInTransaction: jest.fn((fn) => fn()),
          },
        },
        {
          provide: StorageAdapter,
          useValue: {
            getDownloadUrl: jest.fn(),
            moveObject: jest.fn(),
            deleteObject: jest.fn(),
          },
        },
        {
          provide: MediaRepository,
          useValue: {
            create: jest.fn(),
            findByIdNotIn: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UserRepository);
    unitOfWork = module.get(UnitOfWork);
    storageAdapter = module.get(StorageAdapter);
    mediaRepository = module.get(MediaRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserProfile', () => {
    it('should return user profile if found', async () => {
      userRepository.getUserById.mockResolvedValue(mockUser as any);

      const result = await service.getUserProfile('user-1');

      expect(result).toEqual(mockUser);
      expect(userRepository.getUserById).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(service.getUserProfile('user-1')).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should set signed URLs for avatar and cover', async () => {
      const userWithMedias = {
        ...mockUser,
        avatar: { path: 'avatar.png' },
        cover: { path: 'cover.png' },
      };
      userRepository.getUserById.mockResolvedValue(userWithMedias as any);
      storageAdapter.getDownloadUrl.mockImplementation(
        async (path) => `signed-${path}`,
      );

      const result = await service.getUserProfile('user-1');

      expect(result.avatar?.url).toBe('signed-avatar.png');
      expect(result.cover?.url).toBe('signed-cover.png');
    });
  });

  describe('updateProfile', () => {
    it('should update basic profile data', async () => {
      userRepository.getUserById.mockResolvedValue(mockUser as any);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        name: 'New Name',
      } as any);

      const result = await service.updateProfile('user-1', {
        name: 'New Name',
      });

      expect(result.name).toBe('New Name');
      expect(userRepository.update).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ name: 'New Name' }),
      );
    });

    it('should throw BadRequestException for invalid avatar path', async () => {
      userRepository.getUserById.mockResolvedValue(mockUser as any);

      await expect(
        service.updateProfile('user-1', {
          avatar: {
            path: 'invalid/path.png',
            size: 100,
            mime_type: 'image/png',
          },
        }),
      ).rejects.toThrow(new BadRequestException('Invalid avatar path'));
    });

    it('should handle avatar update', async () => {
      userRepository.getUserById.mockResolvedValue(mockUser as any);
      mediaRepository.create.mockResolvedValue({ id: 'new-avatar-id' } as any);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        avatar_id: 'new-avatar-id',
      } as any);

      const result = await service.updateProfile('user-1', {
        avatar: {
          path: 'tmp/users/user-1/avatar.png',
          size: 100,
          mime_type: 'image/png',
        },
      });

      expect(result.avatar_id).toBe('new-avatar-id');
      expect(mediaRepository.create).toHaveBeenCalled();
      expect(storageAdapter.moveObject).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ avatar_id: 'new-avatar-id' }),
      );
    });

    it('should handle cover update and delete old media', async () => {
      const userWithCover = { ...mockUser, cover_id: 'old-cover-id' };
      userRepository.getUserById.mockResolvedValue(userWithCover as any);
      mediaRepository.create.mockResolvedValue({ id: 'new-cover-id' } as any);
      mediaRepository.findByIdNotIn.mockResolvedValue([
        { id: 'old-cover-id', path: 'old-cover.png' },
      ] as any);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        cover_id: 'new-cover-id',
      } as any);

      await service.updateProfile('user-1', {
        cover: {
          path: 'tmp/users/user-1/cover.png',
          size: 100,
          mime_type: 'image/png',
        },
      });

      expect(storageAdapter.deleteObject).toHaveBeenCalledWith('old-cover.png');
      expect(mediaRepository.deleteMany).toHaveBeenCalledWith(['old-cover-id']);
    });
  });
});
