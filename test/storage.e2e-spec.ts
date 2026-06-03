import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { StorageController } from 'src/storage/storage.controller';
import { StorageService } from 'src/storage/storage.service';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/repositories/auth.repository';

describe('StorageController (e2e)', () => {
  let app: INestApplication;
  let storageService: jest.Mocked<StorageService>;

  const mockUser = { id: 'user-1' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: {
            getUploadUrl: jest.fn(),
          },
        },
        { provide: StorageAdapter, useValue: {} },
        { provide: AuthRepository, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    storageService = moduleFixture.get(StorageService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/storage/upload-url/:modelType (GET)', () => {
    it('should return an upload url', () => {
      storageService.getUploadUrl.mockResolvedValue({
        url: 'http://upload.com',
      } as any);

      return request(app.getHttpServer())
        .get('/api/storage/upload-url/avatar?file=test.png')
        .expect(200)
        .expect({ url: 'http://upload.com' });
    });
  });
});
