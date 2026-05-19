import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './repositories/post.repository';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { UnitOfWork } from 'src/db/unit-of-work';
import { UpdatePostDto } from './dto/update-post.dto';
import { Media } from 'src/medias/entities/media.entity';
import {
  LikeReferenceType,
  LikeRepository,
} from './repositories/like.repository';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { CommentRepository } from './repositories/comment.repository';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { PaginationDto } from '../db/dto/pagination.dto';
import { SharedPostRepository } from './repositories/shared-post.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaErrorCode } from 'src/db/prisma/prisma-error-code';
import { User } from 'src/auth/entities/user.entity';
import { BaseNotificationPayload } from 'src/notifications/notifications.listener';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly storageAdapter: StorageAdapter,
    private readonly unitOfWork: UnitOfWork,
    private readonly likeRepository: LikeRepository,
    private readonly commentRepository: CommentRepository,
    private readonly sharedPostRepository: SharedPostRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    const { medias, post } = createPostDto;

    return await this.unitOfWork.runInTransaction(async () => {
      const createdPost = await this.postRepository.create({
        ...post,
        user_id: userId,
      });

      if (medias) {
        if (
          !medias.every((media) => media.path.startsWith(`tmp/users/${userId}`))
        ) {
          throw new BadRequestException('Invalid path');
        }

        const mediaWithPaths = medias.map((media) => {
          const newPath = media.path.replace(
            `tmp/users/${userId}`,
            `public/users/${userId}`,
          );

          return {
            media: {
              ...media,
              path: newPath,
              entity_id: createdPost.id,
              entity_type: 'POST',
              user_id: userId,
            },
            oldPath: media.path,
            newPath,
          };
        });

        const createdMedias = await this.mediaRepository.createMany(
          mediaWithPaths.map((m) => m.media as Media),
        );

        await Promise.all(
          mediaWithPaths.map((media) =>
            this.storageAdapter.moveObject(media.oldPath, media.newPath),
          ),
        );

        return { post: createdPost, medias: createdMedias };
      }

      return createdPost;
    });
  }

  async update(updatePostDto: UpdatePostDto, postId: string, userId: string) {
    const post = await this.postRepository.findOne(postId);

    if (!post) {
      throw new NotAcceptableException('Post not found');
    }

    if (post.user_id !== userId) {
      throw new BadRequestException('You are not the owner of this post');
    }

    const { post: postData, medias } = updatePostDto;

    return await this.unitOfWork.runInTransaction(async () => {
      let updatedPost = post;
      let mediasToDelete: Media[] = [];

      if (postData) {
        updatedPost = await this.postRepository.update(postId, postData);
      }

      if (medias) {
        const mediaWithIds = medias.filter((m) => !!m.id);
        const mediaWithoutIds = medias.filter((m) => !m.id);

        mediasToDelete = await this.mediaRepository.findByIdNotIn(
          mediaWithIds.map((m) => m.id!),
          postId,
        );

        if (mediasToDelete.length) {
          await this.mediaRepository.deleteMany(
            mediasToDelete.map((m) => m.id),
          );
        }

        let createdMedias: Media[] = [];

        if (mediaWithoutIds.length) {
          const mediaWithPaths = mediaWithoutIds.map((media) => {
            const newPath = media.path.replace(
              `tmp/users/${userId}`,
              `public/users/${userId}`,
            );

            return {
              media: {
                ...media,
                path: newPath,
                entity_id: post.id,
                entity_type: 'POST',
                user_id: userId,
              },
              oldPath: media.path,
              newPath,
            };
          });

          createdMedias = await this.mediaRepository.createMany(
            mediaWithPaths.map((m) => m.media as Media),
          );

          await Promise.all(
            mediaWithPaths.map((media) =>
              this.storageAdapter.moveObject(media.oldPath, media.newPath),
            ),
          );
        }

        if (mediasToDelete.length) {
          await Promise.all(
            mediasToDelete.map((media) =>
              this.storageAdapter.deleteObject(media.path),
            ),
          );
        }

        return {
          post: updatedPost,
          medias: [...createdMedias, ...mediaWithIds],
        };
      }

      return updatedPost;
    });
  }

  async delete(postId: string, userId: string) {
    const post = await this.postRepository.findOne(postId, { medias: true });

    if (!post) {
      throw new NotAcceptableException('Post not found');
    }

    if (post.user_id !== userId) {
      throw new BadRequestException('You are not the owner of this post');
    }

    return await this.unitOfWork.runInTransaction(async () => {
      await this.postRepository.delete(postId);

      if (post.medias?.length) {
        await Promise.all(
          post.medias.map((media) =>
            this.storageAdapter.deleteObject(media.path),
          ),
        );
      }

      return { success: true };
    });
  }

  async addLike(postId: string, user: User, type: LikeReferenceType) {
    const post = await this.postRepository.findOne(postId, { user: true });

    if (!post) {
      throw new NotAcceptableException('Post not found');
    }

    const like = await this.likeRepository
      .create(postId, user.id, type)
      .catch((err) => {
        if (err.code === PrismaErrorCode.uniqueConstraint) {
          throw new BadRequestException('You already liked this post');
        }

        throw err;
      });

    this.eventEmitter.emit(
      'post.liked',
      new BaseNotificationPayload({
        actorId: user.id,
        actorName: user.name,
        recipientId: post.user_id,
        referenceId: like.id,
      }),
    );

    return { success: true };
  }

  async deleteLike(likeId: string) {
    await this.likeRepository.delete(likeId);

    return { success: true };
  }

  async getPostComments(postId: string, query: PaginationDto) {
    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const offset = (page - 1) * limit;

    const comments = await this.commentRepository.findByPostId(
      postId,
      limit,
      offset,
    );

    return { comments };
  }

  async getPostCommentsChildren(commentId: string, query: PaginationDto) {
    const limit = query?.limit || 20;
    const page = query?.page || 1;
    const offset = (page - 1) * limit;

    const comments = await this.commentRepository.findChildrenByCommentId(
      commentId,
      limit,
      offset,
    );

    return { comments };
  }

  async addComment(id: string, data: CreatePostCommentDto, user: User) {
    const post = await this.postRepository.findOne(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.commentRepository.create({
      ...data,
      post_id: id,
      user_id: user.id,
    });

    this.eventEmitter.emit(
      'comment.created',
      new BaseNotificationPayload({
        actorId: user.id,
        actorName: user.name,
        recipientId: post.user_id,
        referenceId: comment.id,
      }),
    );

    return { comment };
  }

  async updateComment(id: string, data: UpdatePostCommentDto, userId: string) {
    const comment = await this.commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new BadRequestException('You are not the owner of this comment');
    }

    await this.commentRepository.update(id, data);

    return { success: true };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new BadRequestException('You are not the owner of this comment');
    }
    await this.commentRepository.delete(commentId);

    return { success: true };
  }

  async sharePost(postId: string, user: User) {
    const post = await this.postRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const sharedPost = await this.sharedPostRepository.create(user.id, postId);

    this.eventEmitter.emit(
      'post.shared',
      new BaseNotificationPayload({
        actorId: user.id,
        actorName: user.name,
        recipientId: post.user_id,
        referenceId: sharedPost.id,
      }),
    );

    return { sharedPost };
  }

  async unsharePost(sharedId: string, userId: string) {
    const sharedPost = await this.sharedPostRepository.findById(sharedId);

    if (!sharedPost) {
      throw new NotFoundException('Shared post not found');
    }

    if (sharedPost.user_id !== userId) {
      throw new BadRequestException(
        'You are not the owner of this shared post',
      );
    }

    await this.sharedPostRepository.delete(sharedId);

    return { success: true };
  }
}
