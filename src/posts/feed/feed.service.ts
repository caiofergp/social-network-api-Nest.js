import { Injectable } from '@nestjs/common';
import { FeedRepository } from './repositories/feed.repository';
import { PaginationDto } from 'src/db/dto/pagination.dto';
import { StorageService } from 'src/storage/storage.service';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { Post } from '../entities/post.entity';

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly storageService: StorageAdapter,
  ) {}

  async getFollowedUserPosts(userId: string, paginationDto: PaginationDto) {
    const limit = paginationDto?.limit || 20;
    const page = paginationDto?.page || 1;
    const offset = (page - 1) * limit;

    const posts = await this.feedRepository.getFollowedUserPosts(
      userId,
      limit,
      offset,
    );

    const postsWithSignedUrls = await this.getPostsWithSignedUrls(posts);

    return { posts: postsWithSignedUrls };
  }

  async getRecommendedFeed(userId: string, paginationDto: PaginationDto) {
    const limit = paginationDto?.limit || 20;
    const page = paginationDto?.page || 1;
    const offset = (page - 1) * limit;

    const posts = await this.feedRepository.getRecommendedFeed(
      userId,
      limit,
      offset,
    );

    const postsWithSignedUrls = await this.getPostsWithSignedUrls(posts);

    return { posts: postsWithSignedUrls };
  }

  private async getPostsWithSignedUrls(posts: Post[]) {
    return await Promise.all(
      posts.map(async (post) => {
        if (post?.medias) {
          const signedMedia = await Promise.all(
            post.medias.map(async (mediaItem) => {
              if (!mediaItem.url) return mediaItem;

              const signedUrl = await this.storageService.getDownloadUrl(
                mediaItem.url,
              );
              return { ...mediaItem, url: signedUrl };
            }),
          );

          return { ...post, medias: signedMedia };
        }

        return post;
      }),
    );
  }
}
