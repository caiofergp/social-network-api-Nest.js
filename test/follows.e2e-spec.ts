import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { FollowsController } from 'src/follows/follows.controller';
import { FollowsService } from 'src/follows/follows.service';
import { FollowRepository } from 'src/follows/repositories/follow.repository';
import { AuthGuard } from 'src/guards/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/repositories/auth.repository';

describe('FollowsController (e2e)', () => {
  let app: INestApplication;
  let followRepository: jest.Mocked<FollowRepository>;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FollowsController],
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

    followRepository = moduleFixture.get(FollowRepository);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/follows/:userId (POST)', () => {
    it('should follow a user', () => {
      followRepository.create.mockResolvedValue({
        id: 'follow-1',
        follower_id: 'user-1',
        following_id: 'user-2',
        created_at: new Date(),
      } as any);

      return request(app.getHttpServer())
        .post('/api/follows/user-2')
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toEqual('follow-1');
          expect(followRepository.create).toHaveBeenCalledWith(
            'user-1',
            'user-2',
          );
        });
    });
  });

  describe('/api/follows/:userId (DELETE)', () => {
    it('should unfollow a user', () => {
      followRepository.delete.mockResolvedValue(undefined);

      return request(app.getHttpServer())
        .delete('/api/follows/user-2')
        .expect(200);
    });
  });

  describe('/api/follows/followers/:userId (GET)', () => {
    it('should get followers', () => {
      followRepository.findMany.mockResolvedValue([{ id: 'follow-1' }] as any);

      return request(app.getHttpServer())
        .get('/api/follows/followers/user-1')
        .expect(200)
        .expect([{ id: 'follow-1' }]);
    });
  });

  describe('/api/follows/following/:userId (GET)', () => {
    it('should get following', () => {
      followRepository.findMany.mockResolvedValue([{ id: 'follow-1' }] as any);

      return request(app.getHttpServer())
        .get('/api/follows/following/user-1')
        .expect(200)
        .expect([{ id: 'follow-1' }]);
    });
  });
});
