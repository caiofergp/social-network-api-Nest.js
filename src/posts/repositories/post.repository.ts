import { Post } from '../entities/post.entity';

export abstract class PostRepository {
  abstract create(
    data: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  ): Promise<Post>;
}
