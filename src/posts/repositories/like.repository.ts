import { Like } from '../entities/like.entity';

export abstract class LikeRepository {
  abstract create(postId: string, userId: string): Promise<Like>;
  abstract delete(postId: string, userId: string): Promise<Like>;
}
