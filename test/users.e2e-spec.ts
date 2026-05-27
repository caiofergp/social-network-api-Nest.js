import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/repositories/user.repository';
import { AuthGuard } from 'src/guards/auth.guard';
import { UnitOfWork } from 'src/db/unit-of-work';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/repositories/auth.repository';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
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
        { provide: JwtService, useValue: {} },
        { provide: AuthRepository, useValue: {} },
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

    userRepository = moduleFixture.get(UserRepository);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/users/profile (GET)', () => {
    it('should return the authenticated user profile', () => {
      userRepository.getUserById.mockResolvedValue(mockUser as any);

      return request(app.getHttpServer())
        .get('/api/users/profile')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(mockUser.id);
          expect(userRepository.getUserById).toHaveBeenCalledWith(mockUser.id);
        });
    });
  });

  describe('/api/users/:id (GET)', () => {
    it('should return a user profile by id', () => {
      userRepository.getUserById.mockResolvedValue(mockUser as any);

      return request(app.getHttpServer())
        .get('/api/users/user-1')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(mockUser.id);
        });
    });

    it('should return 404 if user not found', () => {
      userRepository.getUserById.mockResolvedValue(null);

      return request(app.getHttpServer())
        .get('/api/users/non-existent')
        .expect(404);
    });
  });

  describe('/api/users/profile (PATCH)', () => {
    it('should update the authenticated user profile', () => {
      userRepository.getUserById.mockResolvedValue(mockUser as any);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      } as any);

      return request(app.getHttpServer())
        .patch('/api/users/profile')
        .send({ name: 'Updated Name' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toEqual('Updated Name');
          expect(userRepository.update).toHaveBeenCalledWith(
            mockUser.id,
            expect.objectContaining({ name: 'Updated Name' }),
          );
        });
    });
  });
});
