import { Media } from 'src/medias/entities/media.entity';
import { Post } from '../../entities/post.entity';

export type FeedResponse = (Post & {
  _count: {
    likes: number;
    comments: number;
  };
  medias?: Media[];
})[];

export abstract class FeedRepository {
  abstract getFollowedUserPosts(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<FeedResponse>;

  abstract getRecommendedFeed(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<FeedResponse>;
}
