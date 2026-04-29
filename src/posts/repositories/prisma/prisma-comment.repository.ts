import { PrismaService } from 'src/db/prisma/prisma.service';
import { Comment } from '../../entities/comment.entity';
import {
  CommentRepository,
  CommentResponse,
  CreateCommentData,
} from '../comment.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(commentId: string): Promise<Comment | null> {
    return this.prisma.db.comment.findUnique({
      where: { id: commentId, deleted_at: null },
    });
  }

  async findByPostId(
    postId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<CommentResponse> {
    const where = { post_id: postId, deleted_at: null, parent_id: null };

    const [comments, total] = await this.prisma.db.$transaction([
      this.prisma.db.comment.findMany({
        where,
        include: {
          user: true,
          children: {
            take: 2,
            include: {
              user: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.db.comment.count({ where }),
    ]);

    return { comments, total };
  }

  async findChildrenByCommentId(
    commentId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<CommentResponse> {
    const where = { parent_id: commentId, deleted_at: null };

    const [comments, total] = await this.prisma.db.$transaction([
      this.prisma.db.comment.findMany({
        where,
        include: {
          user: true,
          children: {
            take: 2,
            include: {
              user: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.db.comment.count({ where }),
    ]);

    return { comments, total };
  }

  async create(data: CreateCommentData): Promise<Comment> {
    return this.prisma.db.comment.create({ data });
  }

  async update(id: string, data: Partial<CreateCommentData>): Promise<Comment> {
    return this.prisma.db.comment.update({ where: { id }, data });
  }

  async delete(commentId: string): Promise<void> {
    const result = await this.prisma.db.comment.update({
      where: { id: commentId, deleted_at: null },
      data: {
        deleted_at: new Date(),
        children: {
          updateMany: {
            where: { deleted_at: null },
            data: { deleted_at: new Date() },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(commentId);
    }
  }
}
