import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChatsController } from 'src/chats/chats.controller';
import { ChatsService } from 'src/chats/chats.service';
import { ChatsRepository } from 'src/chats/repositories/chats.repository';
import { MessageRepository } from 'src/chats/repositories/message.repository';
import { AuthGuard } from 'src/guards/auth.guard';
import { UnitOfWork } from 'src/db/unit-of-work';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/repositories/auth.repository';

describe('ChatsController (e2e)', () => {
  let app: INestApplication;
  let chatsRepository: jest.Mocked<ChatsRepository>;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        ChatsService,
        {
          provide: ChatsRepository,
          useValue: {
            getUserChats: jest.fn(),
            getChatById: jest.fn(),
            createPrivateChat: jest.fn(),
            createGroupChat: jest.fn(),
          },
        },
        {
          provide: MessageRepository,
          useValue: {
            saveMessage: jest.fn(),
          },
        },
        {
          provide: MediaRepository,
          useValue: {
            createMany: jest.fn(),
          },
        },
        {
          provide: StorageAdapter,
          useValue: {
            moveObject: jest.fn(),
          },
        },
        {
          provide: UnitOfWork,
          useValue: {
            runInTransaction: jest.fn((fn) => fn()),
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

    chatsRepository = moduleFixture.get(ChatsRepository);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/chats/user/:userId (GET)', () => {
    it('should return user chats', () => {
      chatsRepository.getUserChats.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/api/chats/user/user-1')
        .expect(200)
        .expect([]);
    });
  });

  describe('/api/chats/:id (GET)', () => {
    it('should return chat by id', () => {
      chatsRepository.getChatById.mockResolvedValue({ id: 'chat-1' } as any);

      return request(app.getHttpServer())
        .get('/api/chats/chat-1')
        .expect(200)
        .expect({ id: 'chat-1' });
    });
  });

  describe('/api/chats/private (POST)', () => {
    it('should create private chat', () => {
      chatsRepository.createPrivateChat.mockResolvedValue({ id: 'chat-1' } as any);

      return request(app.getHttpServer())
        .post('/api/chats/private')
        .send({ participantId: 'user-2' })
        .expect(201)
        .expect({ id: 'chat-1' });
    });
  });

  describe('/api/chats/group (POST)', () => {
    it('should create group chat', () => {
      chatsRepository.createGroupChat.mockResolvedValue({ id: 'chat-1' } as any);

      return request(app.getHttpServer())
        .post('/api/chats/group')
        .send({ membersId: ['user-2'], name: 'Group Name' })
        .expect(201)
        .expect({ id: 'chat-1' });
    });
  });
});
