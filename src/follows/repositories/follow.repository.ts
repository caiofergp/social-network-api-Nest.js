import { Follow } from '../entities/follow.entity';

export abstract class FollowRepository {
  abstract create(followerId: string, followingId: string): Promise<Follow>;
  abstract delete(followerId: string, followingId: string): Promise<void>;
  abstract findMany(
    where: { follower_id: string } | { following_id: string },
  ): Promise<Follow[]>;
}
