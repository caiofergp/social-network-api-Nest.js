import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { MessageRepository } from './repositories/message.repository';
import { ChatsRepository } from './repositories/chats.repository';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { UnitOfWork } from 'src/db/unit-of-work';
import { BadRequestException } from '@nestjs/common';

describe('ChatsService', () => {
  let service: ChatsService;
  let messageRepository: jest.Mocked<MessageRepository>;
  let chatsRepository: jest.Mocked<ChatsRepository>;
  let mediaRepository: jest.Mocked<MediaRepository>;
  let storageAdapter: jest.Mocked<StorageAdapter>;

  const mockChat = { id: 'chat-1', type: 'PRIVATE' };
  const mockMessage = {
    id: 'msg-1',
    sender_id: 'user-1',
    chat_id: 'chat-1',
    content: 'hello',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        {
          provide: MessageRepository,
          useValue: {
            saveMessage: jest.fn(),
          },
        },
        {
          provide: ChatsRepository,
          useValue: {
            createPrivateChat: jest.fn(),
            createGroupChat: jest.fn(),
            getChatById: jest.fn(),
            getUserChats: jest.fn(),
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
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
    messageRepository = module.get(MessageRepository);
    chatsRepository = module.get(ChatsRepository);
    mediaRepository = module.get(MediaRepository);
    storageAdapter = module.get(StorageAdapter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveMessage', () => {
    it('should save a message without medias', async () => {
      messageRepository.saveMessage.mockResolvedValue(mockMessage as any);

      const result = await service.saveMessage('user-1', 'chat-1', 'hello');

      expect(result).toEqual(mockMessage);
      expect(messageRepository.saveMessage).toHaveBeenCalledWith(
        'user-1',
        'chat-1',
        'hello',
      );
    });

    it('should save a message with medias', async () => {
      messageRepository.saveMessage.mockResolvedValue(mockMessage as any);
      mediaRepository.createMany.mockResolvedValue([{ id: 'media-1' }] as any);

      const medias = [{ path: 'tmp/users/user-1/img.png', type: 'image' }];
      const result = await service.saveMessage(
        'user-1',
        'chat-1',
        'hello',
        medias,
      );

      expect(result.medias).toHaveLength(1);
      expect(storageAdapter.moveObject).toHaveBeenCalled();
      expect(mediaRepository.createMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid media path', async () => {
      const medias = [{ path: 'invalid/path.png', type: 'image' }];
      await expect(
        service.saveMessage('user-1', 'chat-1', 'hello', medias),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createPrivateChat', () => {
    it('should create private chat', async () => {
      chatsRepository.createPrivateChat.mockResolvedValue(mockChat as any);

      const result = await service.createPrivateChat('user-1', 'user-2');

      expect(result).toEqual(mockChat);
      expect(chatsRepository.createPrivateChat).toHaveBeenCalledWith(
        'user-1',
        'user-2',
      );
    });
  });

  describe('createGroupChat', () => {
    it('should create group chat', async () => {
      chatsRepository.createGroupChat.mockResolvedValue(mockChat as any);
      const result = await service.createGroupChat(
        ['user-1', 'user-2'],
        'Group',
      );

      expect(result).toEqual(mockChat);
      expect(chatsRepository.createGroupChat).toHaveBeenCalledWith(
        ['user-1', 'user-2'],
        'Group',
      );
    });
  });

  describe('getChatById', () => {
    it('should get chat by id', async () => {
      chatsRepository.getChatById.mockResolvedValue(mockChat as any);
      const result = await service.getChatById('chat-1');

      expect(result).toEqual(mockChat);
      expect(chatsRepository.getChatById).toHaveBeenCalledWith('chat-1', {
        message: { offset: 0, limit: 20 },
      });
    });
  });

  describe('getUserChats', () => {
    it('should get user chats', async () => {
      chatsRepository.getUserChats.mockResolvedValue([mockChat] as any);
      const result = await service.getUserChats('user-1');

      expect(result).toEqual([mockChat]);
      expect(chatsRepository.getUserChats).toHaveBeenCalledWith(
        'user-1',
        0,
        20,
      );
    });
  });
});
