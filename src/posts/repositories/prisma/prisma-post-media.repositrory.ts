import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { PostMediaRepository } from '../post-media.repository';
import { PostMedia } from '../../entities/post-media';
import { randomUUID } from 'node:crypto';

@Injectable()
export class PrismaPostMediaRepository implements PostMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdNotIn(ids: string[], postId: string): Promise<PostMedia[]> {
    return await this.prisma.db.postMedia.findMany({
      where: {
        post_id: postId,
        id: {
          notIn: ids,
        },
      },
    });
  }

  async create(
    data: Omit<PostMedia, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  ): Promise<PostMedia> {
    return await this.prisma.db.postMedia.create({
      data,
    });
  }

  async createMany(data: PostMedia[]): Promise<PostMedia[]> {
    const dataWithId = data.map((media) => ({
      ...media,
      id: randomUUID(),
    }));

    await this.prisma.db.postMedia.createMany({
      data: dataWithId,
    });

    return dataWithId;
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prisma.db.postMedia.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
