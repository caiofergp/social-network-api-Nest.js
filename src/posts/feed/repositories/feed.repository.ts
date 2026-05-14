import { Post } from '../../entities/post.entity';

export abstract class FeedRepository {
  abstract getFollowedUserPosts(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Post[]>;

  abstract getRecommendedFeed(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Post[]>;
}
