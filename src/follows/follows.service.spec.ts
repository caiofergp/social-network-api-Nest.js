import { Test, TestingModule } from '@nestjs/testing';
import { FollowsService } from './follows.service';
import { FollowRepository } from './repositories/follow.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('FollowsService', () => {
  let service: FollowsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        { provide: FollowRepository, useValue: {} },
        { provide: EventEmitter2, useValue: {} },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
