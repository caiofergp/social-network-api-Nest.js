import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { LikeReferenceType, LikeRepository } from '../like.repository';
import { Like } from 'src/posts/entities/like.entity';

@Injectable()
export class PrismaLikeRepository implements LikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    referenceId: string,
    userId: string,
    type: LikeReferenceType,
  ): Promise<Like> {
    return await this.prisma.db.like.create({
      data: { reference_id: referenceId, user_id: userId, type },
    });
  }

  async delete(referenceId: string, userId: string): Promise<Like> {
    return await this.prisma.db.like.delete({
      where: {
        user_id_reference_id: {
          user_id: userId,
          reference_id: referenceId,
        },
      },
    });
  }
}
