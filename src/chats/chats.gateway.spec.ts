import { Test, TestingModule } from '@nestjs/testing';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UnitOfWork } from 'src/db/unit-of-work';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Message } from './entities/message.entity';
import { Chat } from './entities/chat.entity';

describe('ChatsGateway', () => {
  let gateway: ChatsGateway;
  let chatsService: jest.Mocked<ChatsService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockSocket = {
    data: { userId: 'user-1' },
    emit: jest.fn(),
  } as unknown as Socket;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as unknown as Server;

  const mockMessage = { id: 'msg-1', content: 'test' };
  const mockChat = {
    id: 'chat-1',
    members: [
      { user: { id: 'user-1', name: 'User 1' } },
      { user: { id: 'user-2', name: 'User 2' } },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsGateway,
        {
          provide: ChatsService,
          useValue: {
            saveMessage: jest.fn(),
            getChatById: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emitAsync: jest.fn(),
          },
        },
        {
          provide: UnitOfWork,
          useValue: {
            runInTransaction: jest.fn((fn) => fn()),
          },
        },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    gateway = module.get<ChatsGateway>(ChatsGateway);
    chatsService = module.get(ChatsService);
    eventEmitter = module.get(EventEmitter2);
    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleMessage', () => {
    it('should save message and notify other members', async () => {
      chatsService.saveMessage.mockResolvedValue(mockMessage as Message);
      chatsService.getChatById.mockResolvedValue(mockChat as Chat);

      const payload = { chatId: 'chat-1', content: 'test' };
      const result = await gateway.handleMessage(mockSocket, payload);

      expect(result).toEqual({ status: 'sent', data: mockMessage });
      expect(chatsService.saveMessage).toHaveBeenCalledWith(
        'user-1',
        'chat-1',
        'test',
        undefined,
      );
      expect(mockServer.to).toHaveBeenCalledWith('user_user-2');
      expect(mockServer.emit).toHaveBeenCalledWith('new_message', mockMessage);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        'chat.message.created',
        expect.any(Object),
      );
    });

    it('should return failed status if chat not found', async () => {
      chatsService.saveMessage.mockResolvedValue(mockMessage as Message);
      chatsService.getChatById.mockResolvedValue(null);

      const payload = { chatId: 'chat-1', content: 'test' };
      const result = await gateway.handleMessage(mockSocket, payload);

      expect(result).toEqual({ status: 'failed', data: 'Chat not found' });
    });

    it('should return failed status if sender not in chat', async () => {
      chatsService.saveMessage.mockResolvedValue(mockMessage as Message);
      chatsService.getChatById.mockResolvedValue({
        id: 'chat-1',
        members: [{ user: { id: 'other-user' } }],
      } as Chat);

      const payload = { chatId: 'chat-1', content: 'test' };
      const result = await gateway.handleMessage(mockSocket, payload);

      expect(result).toEqual({ status: 'failed', data: 'User not found' });
    });

    it('should return failed status if chat members not found', async () => {
      chatsService.saveMessage.mockResolvedValue(mockMessage as Message);

      chatsService.getChatById.mockResolvedValue({
        id: 'chat-1',
        members: undefined,
      } as Chat);

      const payload = { chatId: 'chat-1', content: 'test' };
      const result = await gateway.handleMessage(mockSocket, payload);

      expect(result).toEqual({ status: 'failed', data: 'User not found' });
    });
  });
});
