import { Follow } from '../entities/follow.entity';

export abstract class FollowRepository {
  abstract create(followerId: string, followingId: string): Promise<void>;
  abstract delete(followerId: string, followingId: string): Promise<void>;
  abstract findMany(
    where: { followerId: string } | { followingId: string },
  ): Promise<Follow[]>;
}
