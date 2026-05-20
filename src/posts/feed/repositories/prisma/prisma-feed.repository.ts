import { Injectable } from '@nestjs/common';
import { FeedRepository, FeedResponse } from '../feed.repository';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class PrismaFeedRepository implements FeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getFollowedUserPosts(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<FeedResponse> {
    return await this.prisma.db.post.findMany({
      where: {
        deleted_at: null,
        user: {
          followers: {
            some: { follower_id: userId },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
      include: {
        user: true,
        medias: {
          where: { deleted_at: null },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  async getRecommendedFeed(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<FeedResponse> {
    return await this.prisma.db.post.findMany({
      where: {
        deleted_at: null,
        user_id: { not: userId },
        user: {
          followers: {
            none: { follower_id: userId },
          },
        },
        created_at: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // last 14 days
        },
      },
      orderBy: [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { created_at: 'desc' },
      ],
      skip: offset,
      take: limit,
      include: {
        user: true,
        medias: {
          where: { deleted_at: null },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }
}
