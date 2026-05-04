import { Post } from '../entities/post.entity';

export interface PostFindOptions {
  user?: boolean;
  medias?: boolean;
}

export abstract class PostRepository {
  abstract create(
    data: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  ): Promise<Post>;
  abstract findOne(id: string, include?: PostFindOptions): Promise<Post | null>;
  abstract update(id: string, data: Partial<Post>): Promise<Post>;
  abstract delete(id: string): Promise<void>;
}
