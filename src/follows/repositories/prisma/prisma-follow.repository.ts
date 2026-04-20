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
        followerId,
        followingId,
      },
    });
  }

  async delete(followerId: string, followingId: string): Promise<void> {
    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async findMany(
    where: { followerId: string } | { followingId: string },
  ): Promise<Follow[]> {
    return await this.prisma.follow.findMany({ where });
  }
}
