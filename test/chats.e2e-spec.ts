import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChatsController } from 'src/chats/chats.controller';
import { ChatsService } from 'src/chats/chats.service';
import { ChatsRepository } from 'src/chats/repositories/chats.repository';
import { PrismaChatsRepository } from 'src/chats/repositories/prisma/prisma-chats.repository';
import { MessageRepository } from 'src/chats/repositories/message.repository';
import { PrismaMessageRepository } from 'src/chats/repositories/prisma/prisma-message.repository';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { PrismaMediaRepository } from 'src/medias/repositories/prisma/prisma-media.repository';
import { AuthGuard } from 'src/guards/auth.guard';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { UnitOfWork } from 'src/db/unit-of-work';
import { PrismaUnitOfWork } from 'src/db/prisma/prisma-unit-of-work';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/repositories/auth.repository';
import { PrismaAuthRepository } from 'src/auth/repositories/prisma/prisma-auth.repository';
import { mockUser } from 'src/db/prisma/seeder/main';
import { faker } from '@faker-js/faker';
import { ChatType } from 'src/chats/entities/chat.entity';

describe('ChatsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        ChatsService,
        { provide: ChatsRepository, useClass: PrismaChatsRepository },
        { provide: MessageRepository, useClass: PrismaMessageRepository },
        { provide: MediaRepository, useClass: PrismaMediaRepository },
        { provide: AuthRepository, useClass: PrismaAuthRepository },
        {
          provide: StorageAdapter,
          useValue: { moveObject: jest.fn().mockResolvedValue('path') },
        },
        PrismaService,
        { provide: UnitOfWork, useClass: PrismaUnitOfWork },
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

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/api/chats/user/:userId (GET)', () => {
    it('should return the chat between the authenticated user and the specified user', async () => {
      const otherUser = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: 'password',
        },
      });

      const chat = await prisma.chat.create({
        data: {
          type: ChatType.PRIVATE,
          name: otherUser.name,
          members: {
            createMany: {
              data: [
                {
                  user_id: mockUser.id,
                },
                {
                  user_id: otherUser.id,
                },
              ],
            },
          },
        },
      });

      const messages = [
        {
          id: faker.string.uuid(),
          chat_id: chat.id,
          sender_id: mockUser.id,
          content: faker.lorem.sentence(),
          created_at: new Date(Date.now() + 1000),
          updated_at: new Date(Date.now() + 1000),
        },
        {
          id: faker.string.uuid(),
          chat_id: chat.id,
          sender_id: otherUser.id,
          content: faker.lorem.sentence(),
        },
      ];

      await prisma.message.createMany({
        data: messages,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/chats/user/${otherUser.id}`)
        .expect(200);

      expect(response.body[0].id).toBe(chat.id);
      expect(response.body[0].members).toContainEqual(
        expect.objectContaining({ user_id: mockUser.id }),
      );
      expect(response.body[0].members).toContainEqual(
        expect.objectContaining({ user_id: otherUser.id }),
      );
      expect(response.body[0].messages.length).toBe(1);
      expect(response.body[0].messages[0].id).toBe(messages[0].id);
    });
  });

  describe('/api/chats/:id (GET)', () => {
    it('should return the chat by id', async () => {
      const otherUser = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: 'password',
        },
      });

      const chat = await prisma.chat.create({
        data: {
          type: ChatType.PRIVATE,
          name: otherUser.name,
          members: {
            createMany: {
              data: [
                {
                  user_id: mockUser.id,
                },
                {
                  user_id: otherUser.id,
                },
              ],
            },
          },
        },
      });

      const messages = [
        {
          id: faker.string.uuid(),
          chat_id: chat.id,
          sender_id: mockUser.id,
          content: faker.lorem.sentence(),
          created_at: new Date(Date.now() + 1000),
          updated_at: new Date(Date.now() + 1000),
        },
        {
          id: faker.string.uuid(),
          chat_id: chat.id,
          sender_id: otherUser.id,
          content: faker.lorem.sentence(),
        },
      ];

      await prisma.message.createMany({
        data: messages,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/chats/${chat.id}`)
        .expect(200);

      expect(response.body.id).toBe(chat.id);
      expect(response.body.members).toContainEqual(
        expect.objectContaining({ user_id: mockUser.id }),
      );
      expect(response.body.members).toContainEqual(
        expect.objectContaining({ user_id: otherUser.id }),
      );
      expect(response.body.messages.length).toBe(2);
      expect(response.body.messages[0].id).toBe(messages[1].id);
      expect(response.body.messages[1].id).toBe(messages[0].id);
    });
  });

  describe('/api/chats/private (POST)', () => {
    it('should create a private chat in the database', async () => {
      const otherUser = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: 'password',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/chats/private')
        .send({ participantId: otherUser.id })
        .expect(201);

      expect(response.body.id).toBeDefined();

      const chat = await prisma.chat.findUnique({
        where: { id: response.body.id },
        include: { members: true },
      });

      expect(chat?.members.length).toBe(2);
    });
  });

  describe('/api/chats/group (POST)', () => {
    it('should create a group chat in the database', async () => {
      const otherUser = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: 'password',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/chats/group')
        .send({
          name: 'Group Chat',
          membersId: [mockUser.id, otherUser.id],
        })
        .expect(201);

      expect(response.body.id).toBeDefined();

      const chat = await prisma.chat.findUnique({
        where: { id: response.body.id },
        include: { members: true },
      });

      expect(chat?.members.length).toBe(2);
    });
  });
});
