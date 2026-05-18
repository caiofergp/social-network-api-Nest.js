import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { MessageRepository } from './repositories/message.repository';
import { ChatsRepository } from './repositories/chats.repository';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { UnitOfWork } from 'src/db/unit-of-work';

describe('ChatsService', () => {
  let service: ChatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        { provide: MessageRepository, useValue: {} },
        { provide: ChatsRepository, useValue: {} },
        { provide: MediaRepository, useValue: {} },
        { provide: StorageAdapter, useValue: {} },
        { provide: UnitOfWork, useValue: {} },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
