export abstract class FollowRepository {
  abstract create(followerId: string, followingId: string): Promise<void>;
  abstract delete(followerId: string, followingId: string): Promise<void>;
}
