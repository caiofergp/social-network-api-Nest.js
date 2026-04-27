import { PostMedia } from '../entities/post-media';

type CreatePostMedia = 'id' | 'created_at' | 'updated_at' | 'deleted_at';

export abstract class PostMediaRepository {
  abstract create(data: Omit<PostMedia, CreatePostMedia>): Promise<PostMedia>;
  abstract createMany(
    data: Omit<PostMedia, CreatePostMedia>[],
  ): Promise<PostMedia[]>;
}
