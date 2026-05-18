import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { UnitOfWork } from 'src/db/unit-of-work';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { MediaRepository } from 'src/medias/repositories/media.repository';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: {} },
        { provide: UnitOfWork, useValue: {} },
        { provide: StorageAdapter, useValue: {} },
        { provide: MediaRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
