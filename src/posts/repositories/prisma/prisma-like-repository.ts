import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { LikeRepository } from '../like.repository';
import { Like } from 'src/posts/entities/like.entity';

@Injectable()
export class PrismaLikeRepository implements LikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(postId: string, userId: string): Promise<Like> {
    return this.prisma.db.like.create({
      data: { post_id: postId, user_id: userId },
    });
  }

  async delete(postId: string, userId: string): Promise<Like> {
    return this.prisma.db.like.delete({
      where: { user_id_post_id: { user_id: userId, post_id: postId } },
    });
  }
}
