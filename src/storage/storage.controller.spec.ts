import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { AuthGuard } from '../guards/auth.guard';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';

describe('StorageController', () => {
  let controller: StorageController;
  let storageService: StorageService;
  let storageAdapter: jest.Mocked<StorageAdapter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        StorageService,
        {
          provide: StorageAdapter,
          useValue: {
            getUploadUrl: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StorageController>(StorageController);
    storageService = module.get<StorageService>(StorageService);
    storageAdapter = module.get(StorageAdapter);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an upload URL', async () => {
    const req = { user: { id: 'user123' } } as any;
    const params = { modelType: 'PROFILE' } as any;
    const query = { file: 'profile.png' } as any;

    const mockUrl = 'https://storage.example.com/upload-url';
    const path = new RegExp(
      `^tmp/users/${req.user.id}/${params.modelType}s/.*\\.png$`,
    );

    storageAdapter.getUploadUrl.mockResolvedValue(mockUrl);

    const result = await controller.getUploadUrl(req, params, query);

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
