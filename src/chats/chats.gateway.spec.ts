import { Test, TestingModule } from '@nestjs/testing';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UnitOfWork } from 'src/db/unit-of-work';
import { JwtService } from '@nestjs/jwt';

describe('ChatsGateway', () => {
  let gateway: ChatsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsGateway,
        { provide: ChatsService, useValue: {} },
        { provide: EventEmitter2, useValue: {} },
        { provide: UnitOfWork, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    gateway = module.get<ChatsGateway>(ChatsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
