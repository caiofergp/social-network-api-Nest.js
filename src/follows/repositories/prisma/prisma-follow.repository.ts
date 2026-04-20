import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { FollowRepository } from '../follow.repository';
import { Follow } from 'src/follows/entities/follow.entity';

@Injectable()
export class PrismaFollowRepository implements FollowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(followerId: string, followingId: string): Promise<void> {
    await this.prisma.follow.create({
      data: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
  }

  async delete(followerId: string, followingId: string): Promise<void> {
    await this.prisma.follow.delete({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    });
  }

  async findMany(
    where: { follower_id: string } | { following_id: string },
  ): Promise<Follow[]> {
    return await this.prisma.follow.findMany({ where });
  }
}
