import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './repositories/post.repository';
import { PostMediaRepository } from './repositories/post-media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { UnitOfWork } from 'src/db/unit-of-work';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostMedia } from './entities/post-media.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postMediaRepository: PostMediaRepository,
    private readonly storageAdapter: StorageAdapter,
    private readonly unitOfWork: UnitOfWork,
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
            media: { ...media, path: newPath, post_id: createdPost.id },
            oldPath: media.path,
            newPath,
          };
        });

        const createdMedias = await this.postMediaRepository.createMany(
          mediaWithPaths.map((m) => m.media),
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
      let mediasToDelete: PostMedia[] = [];

      if (postData) {
        updatedPost = await this.postRepository.update(postId, postData);
      }

      if (medias) {
        const mediaWithIds = medias.filter((m) => !!m.id);
        const mediaWithoutIds = medias.filter((m) => !m.id);

        mediasToDelete = await this.postMediaRepository.findByIdNotIn(
          mediaWithIds.map((m) => m.id!),
          postId,
        );

        if (mediasToDelete.length) {
          await this.postMediaRepository.deleteMany(
            mediasToDelete.map((m) => m.id),
          );
        }

        let createdMedias: PostMedia[] = [];

        if (mediaWithoutIds.length) {
          const mediaWithPaths = mediaWithoutIds.map((media) => {
            const newPath = media.path.replace(
              `tmp/users/${userId}`,
              `public/users/${userId}`,
            );

            return {
              media: { ...media, path: newPath, post_id: post.id },
              oldPath: media.path,
              newPath,
            };
          });

          createdMedias = await this.postMediaRepository.createMany(
            mediaWithPaths.map((m) => m.media),
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
}
