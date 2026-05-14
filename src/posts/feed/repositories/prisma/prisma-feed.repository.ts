import { Injectable } from '@nestjs/common';
import { FeedRepository } from '../feed.repository';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { Post } from '../../../entities/post.entity';

@Injectable()
export class PrismaFeedRepository implements FeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getFollowedUserPosts(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Post[]> {
    return (await this.prisma.db.post.findMany({
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
    })) as unknown as Post[];
  }

  async getRecommendedFeed(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Post[]> {
    return (await this.prisma.db.post.findMany({
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
    })) as unknown as Post[];
  }
}
