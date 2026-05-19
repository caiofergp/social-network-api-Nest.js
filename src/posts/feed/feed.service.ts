import { Injectable } from '@nestjs/common';
import { FeedRepository } from './repositories/feed.repository';
import { PaginationDto } from 'src/db/dto/pagination.dto';

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  async getFollowedUserPosts(userId: string, paginationDto: PaginationDto) {
    const limit = paginationDto?.limit || 20;
    const page = paginationDto?.page || 1;
    const offset = (page - 1) * limit;

    const posts = await this.feedRepository.getFollowedUserPosts(
      userId,
      limit,
      offset,
    );

    return { posts };
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

    return { posts };
  }
}
