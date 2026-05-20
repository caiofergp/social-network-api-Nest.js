import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { FeedRepository, FeedResponse } from './repositories/feed.repository';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';

describe('FeedService', () => {
  let feedService: FeedService;
  let feedRepository: jest.Mocked<FeedRepository>;
  let storageDapter: jest.Mocked<StorageAdapter>;

  const now = new Date();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: FeedRepository,
          useValue: {
            getFollowedUserPosts: jest.fn(),
            getRecommendedFeed: jest.fn(),
          },
        },
        {
          provide: StorageAdapter,
          useValue: {
            getDownloadUrl: jest.fn(),
            getUploadUrl: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    feedService = module.get(FeedService);
    feedRepository = module.get(FeedRepository);
    storageDapter = module.get(StorageAdapter);
  });

  it('should be defined', () => {
    expect(feedService).toBeDefined();
  });

  describe('getFollowedUserPosts', () => {
    it('should return followed user posts', async () => {
      const mockPosts: FeedResponse = [
        {
          id: '1',
          user_id: 'user2',
          content: 'Post 1',
          _count: { likes: 5, comments: 2 },
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
        {
          id: '2',
          user_id: 'user2',
          content: 'Post 2',
          _count: { likes: 3, comments: 1 },
          created_at: now,
          updated_at: now,
          deleted_at: null,
          medias: [
            {
              id: 'media1',
              type: 'image',
              url: 'media-url',
              mime_type: 'image/jpeg',
              entity_type: 'post',
              entity_id: '2',
              path: 'media/path',
              created_at: now,
              updated_at: now,
            },
          ],
        },
      ];

      feedRepository.getFollowedUserPosts.mockResolvedValue(mockPosts);
      storageDapter.getDownloadUrl.mockResolvedValue('signed-url');
      mockPosts[1].medias![0].url = 'signed-url';

      const result = await feedService.getFollowedUserPosts('user1', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({ posts: mockPosts });
    });

    it('should return empty array if no followed user posts', async () => {
      feedRepository.getFollowedUserPosts.mockResolvedValue([]);

      const result = await feedService.getFollowedUserPosts('user1', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({ posts: [] });
    });
  });

  describe('getRecommendedFeed', () => {
    it('should return recommended feed', async () => {
      const mockPosts: FeedResponse = [
        {
          id: '3',
          user_id: 'user2',
          content: 'Post 3',
          _count: { likes: 4, comments: 1 },
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
        {
          id: '4',
          user_id: 'user3',
          content: 'Post 4',
          _count: { likes: 2, comments: 0 },
          created_at: now,
          updated_at: now,
          deleted_at: null,
          medias: [
            {
              id: 'media2',
              type: 'image',
              url: 'media-url',
              mime_type: 'image/jpeg',
              entity_type: 'post',
              entity_id: '4',
              path: 'media/path',
              created_at: now,
              updated_at: now,
            },
          ],
        },
      ];

      feedRepository.getRecommendedFeed.mockResolvedValue(mockPosts);
      storageDapter.getDownloadUrl.mockResolvedValue('signed-url');
      mockPosts[1].medias![0].url = 'signed-url';

      const result = await feedService.getRecommendedFeed('user1', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({ posts: mockPosts });
    });

    it('should return empty array if no recommended feed', async () => {
      feedRepository.getRecommendedFeed.mockResolvedValue([]);

      const result = await feedService.getRecommendedFeed('user1', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({ posts: [] });
    });
  });
});
