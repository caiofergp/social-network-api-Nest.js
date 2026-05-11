import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { MediaRepository } from '../media.repository';
import { Media } from '../../entities/media.entity';
import { randomUUID } from 'node:crypto';

@Injectable()
export class PrismaMediaRepository implements MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdNotIn(ids: string[], entityId: string): Promise<Media[]> {
    return await this.prisma.db.media.findMany({
      where: {
        entity_id: entityId,
        id: {
          notIn: ids,
        },
      },
    });
  }

  async create(
    data: Omit<Media, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  ): Promise<Media> {
    return await this.prisma.db.media.create({
      data,
    });
  }

  async createMany(data: Media[]): Promise<Media[]> {
    const dataWithId = data.map((media) => ({
      ...media,
      id: randomUUID(),
    }));

    await this.prisma.db.media.createMany({
      data: dataWithId,
    });

    return dataWithId;
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prisma.db.media.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
