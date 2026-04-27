import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './repositories/post.repository';
import { PostMediaRepository } from './repositories/post-media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { UnitOfWork } from 'src/db/unit-of-work';

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
    console.log('User ID:', userId);
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
}
