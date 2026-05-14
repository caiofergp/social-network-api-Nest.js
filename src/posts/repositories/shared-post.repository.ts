import { SharedPost } from '../entities/shared-post.entity';

export abstract class SharedPostRepository {
  abstract create(user_id: string, post_id: string): Promise<SharedPost>;
  abstract delete(sharedId: string): Promise<void>;
  abstract findById(sharedId: string): Promise<SharedPost | null>;
}
