import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { PostMediaRepository } from '../post-media.repository';
import { PostMedia } from '../../entities/post-media';
import { randomUUID } from 'node:crypto';

@Injectable()
export class PrismaPostMediaRepository implements PostMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

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
      data,
    });

    return dataWithId;
  }
}
