import { PostFindOptions, PostRepository } from '../post.repository';
import { Post } from '../../entities/post.entity';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class PrismaPostRepository implements PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  ): Promise<Post> {
    return await this.prisma.db.post.create({
      data,
    });
  }

  async findOne(id: string, options?: PostFindOptions): Promise<Post | null> {
    return await this.prisma.db.post.findUnique({
      where: { id },
      include: {
        media: !!options?.medias,
      },
    });
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    return await this.prisma.db.post.update({
      where: { id },
      data,
    });
  }
}
