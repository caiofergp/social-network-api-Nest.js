import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { FollowsController } from 'src/follows/follows.controller';
import { FollowsService } from 'src/follows/follows.service';
import { FollowRepository } from 'src/follows/repositories/follow.repository';
import { PrismaFollowRepository } from 'src/follows/repositories/prisma/prisma-follow.repository';
import { AuthGuard } from 'src/guards/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/repositories/auth.repository';
import { PrismaAuthRepository } from 'src/auth/repositories/prisma/prisma-auth.repository';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { mockUser } from 'src/db/prisma/seeder/main';
import { User } from 'src/users/entities/user.entity';

describe('FollowsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FollowsController],
      providers: [
        FollowsService,
        { provide: FollowRepository, useClass: PrismaFollowRepository },
        { provide: AuthRepository, useClass: PrismaAuthRepository },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: JwtService, useValue: {} },
        PrismaService,
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

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/api/follows/:userId (POST)', () => {
    it('should follow a user', async () => {
      const otherUser = await prisma.user.create({
        data: {
          id: 'user-other-follow',
          name: 'Other User',
          email: 'other-follow@example.com',
          password: 'password',
        },
      });

      await request(app.getHttpServer())
        .post(`/api/follows/${otherUser.id}`)
        .expect(201);

      const follow = await prisma.follow.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: mockUser.id,
            following_id: otherUser.id,
          },
        },
      });
      expect(follow).toBeDefined();
    });
  });

  describe('/api/follows/:userId (DELETE)', () => {
    it('should unfollow a user', async () => {
      const otherUser = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      });

      await prisma.follow.create({
        data: {
          follower_id: mockUser.id,
          following_id: otherUser.id,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/follows/${otherUser.id}`)
        .expect(200);

      const follow = await prisma.follow.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: mockUser.id,
            following_id: otherUser.id,
          },
        },
      });

      expect(follow).toBeNull();
    });
  });

  describe('/api/follows/followers/:userId (GET)', () => {
    it('should return the followers of a user', async () => {
      const otherUser = await prisma.user.create({
        data: {
          id: 'user-other-followers',
          name: 'Other User',
          email: 'other-followers@example.com',
          password: 'password',
        },
      });

      await prisma.follow.create({
        data: {
          follower_id: mockUser.id,
          following_id: otherUser.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/follows/followers/${otherUser.id}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].follower_id).toBe(mockUser.id);
      expect(response.body[0].following_id).toBe(otherUser.id);
    });
  });

  describe('/api/follows/following/:userId (GET)', () => {
    it('should return the users that a user is following', async () => {
      const users: User[] = [
        {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          token: null,
          expires_at: null,
        },
        {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          token: null,
          expires_at: null,
        },
      ];

      await prisma.user.createMany({
        data: users,
      });

      await prisma.follow.create({
        data: {
          follower_id: users[0].id,
          following_id: users[1].id,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/follows/following/${users[0].id}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].follower_id).toBe(users[0].id);
      expect(response.body[0].following_id).toBe(users[1].id);
    });
  });
});
