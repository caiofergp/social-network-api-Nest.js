import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { StorageAdapter } from '../adapters/storage/storage.adapter';
import { User } from 'src/users/entities/user.entity';
import { StorageModel } from './dto/get-upload-url.dto';

describe('StorageService', () => {
  let service: StorageService;
  let storageAdapter: jest.Mocked<StorageAdapter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: StorageAdapter,
          useValue: {
            getUploadUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(StorageService);
    storageAdapter = module.get(StorageAdapter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an upload URL', async () => {
    const mockUser = { id: 'user123' } as User;
    const mockModelType = StorageModel.PROFILE;
    const mockFileName = 'profile.png';
    const mockUrl = 'https://storage.example.com/upload-url';
    const path = new RegExp(
      `^tmp/users/${mockUser.id}/${mockModelType}s/.*\\.png$`,
    );

    storageAdapter.getUploadUrl.mockResolvedValue(mockUrl);

    const result = await service.getUploadUrl(
      mockUser,
      mockModelType,
      mockFileName,
    );

    expect(storageAdapter.getUploadUrl).toHaveBeenCalledWith(
      expect.stringMatching(path),
      3600,
      5 * 1024 * 1024,
    );

    expect(result).toEqual({
      url: mockUrl,
      path: expect.stringMatching(path),
    });
  });
});
