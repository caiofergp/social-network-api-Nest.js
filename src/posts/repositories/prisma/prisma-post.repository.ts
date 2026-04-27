import { PostRepository } from '../post.repository';
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
}
