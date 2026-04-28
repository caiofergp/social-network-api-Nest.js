import { PostFindOptions, PostRepository } from '../post.repository';
import { Post } from '../../entities/post.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';

type CreatePostData = Omit<
  Post,
  'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'medias'
>;

@Injectable()
export class PrismaPostRepository implements PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePostData): Promise<Post> {
    return await this.prisma.db.post.create({
      data,
    });
  }

  async findOne(id: string, options?: PostFindOptions): Promise<Post | null> {
    return await this.prisma.db.post.findUnique({
      where: { id, deleted_at: null },
      include: {
        medias: !!options?.medias,
      },
    });
  }

  async update(id: string, data: Partial<Omit<Post, 'medias'>>): Promise<Post> {
    return await this.prisma.db.post.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    const updatedPost = await this.prisma.db.post.update({
      where: { id, deleted_at: null },
      data: {
        deleted_at: new Date(),
        medias: {
          updateMany: {
            where: { post_id: id, deleted_at: null },
            data: { deleted_at: new Date() },
          },
        },
      },
    });

    await this.prisma.db.like.deleteMany({
      where: { post_id: id },
    });

    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }
  }
}
