import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostRepository } from './repositories/post.repository';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { UnitOfWork } from 'src/db/unit-of-work';
import { LikeRepository } from './repositories/like.repository';
import { CommentRepository } from './repositories/comment.repository';
import { SharedPostRepository } from './repositories/shared-post.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PostRepository, useValue: {} },
        { provide: MediaRepository, useValue: {} },
        { provide: StorageAdapter, useValue: {} },
        { provide: UnitOfWork, useValue: {} },
        { provide: LikeRepository, useValue: {} },
        { provide: CommentRepository, useValue: {} },
        { provide: SharedPostRepository, useValue: {} },
        { provide: EventEmitter2, useValue: {} },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
