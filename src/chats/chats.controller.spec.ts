import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import { Chat } from './entities/chat.entity';

describe('ChatsController', () => {
  let controller: ChatsController;
  let service: jest.Mocked<ChatsService>;

  const mockRequest = {
    user: { id: 'user-1' },
  } as unknown as Request;

  const mockPrivateChat: Chat = {
    id: 'chat-1',
    members: [],
    messages: [],
    created_at: new Date(),
    updated_at: new Date(),
    type: 'private',
  };

  const mockGroupChat: Chat = {
    id: 'chat-2',
    members: [],
    messages: [],
    created_at: new Date(),
    updated_at: new Date(),
    type: 'group',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        {
          provide: ChatsService,
          useValue: {
            getUserChats: jest.fn(),
            getChatById: jest.fn(),
            createPrivateChat: jest.fn(),
            createGroupChat: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ChatsController>(ChatsController);
    service = module.get(ChatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserChats', () => {
    it('should call service.getUserChats', async () => {
      service.getUserChats.mockResolvedValue([]);

      await controller.getUserChats('user-1', { page: 1, limit: 10 });

      expect(service.getUserChats).toHaveBeenCalledWith('user-1', 1, 10);
    });
  });

  describe('getChatById', () => {
    it('should call service.getChatById', async () => {
      service.getChatById.mockResolvedValue(mockPrivateChat);

      const result = await controller.getChatById('chat-1', {
        page: 1,
        limit: 10,
      });

      expect(service.getChatById).toHaveBeenCalledWith('chat-1', 1, 10);
      expect(result).toEqual(mockPrivateChat);
    });
  });

  describe('createPrivateChat', () => {
    it('should call service.createPrivateChat', async () => {
      service.createPrivateChat.mockResolvedValue(mockPrivateChat);

      const result = await controller.createPrivateChat(
        { participantId: 'user-2' },
        mockRequest,
      );

      expect(service.createPrivateChat).toHaveBeenCalledWith(
        'user-1',
        'user-2',
      );
      expect(result).toEqual(mockPrivateChat);
    });
  });

  describe('createGroupChat', () => {
    it('should call service.createGroupChat', async () => {
      service.createGroupChat.mockResolvedValue(mockGroupChat);

      const result = await controller.createGroupChat({
        membersId: ['user-2'],
        name: 'Group',
      });

      expect(service.createGroupChat).toHaveBeenCalledWith(['user-2'], 'Group');
      expect(result).toEqual(mockGroupChat);
    });
  });
});
