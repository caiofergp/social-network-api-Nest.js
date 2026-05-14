import { SharedPost } from 'src/posts/entities/shared-post.entity';
import { SharedPostRepository } from '../shared-post.repository';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaSharedPostRepository implements SharedPostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(sharedId: string): Promise<SharedPost | null> {
    return await this.prisma.sharedPost.findUnique({
      where: {
        id: sharedId,
      },
    });
  }

  async create(user_id: string, post_id: string): Promise<SharedPost> {
    return await this.prisma.sharedPost.create({
      data: {
        user_id,
        post_id,
      },
    });
  }

  async delete(sharedId: string): Promise<void> {
    await this.prisma.sharedPost.delete({
      where: {
        id: sharedId,
      },
    });
  }
}
