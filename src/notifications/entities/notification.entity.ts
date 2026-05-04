import { Comment } from 'src/posts/entities/comment.entity';
import { Follow } from 'src/follows/entities/follow.entity';
import { Post } from 'src/posts/entities/post.entity';
import { SharedPost } from 'src/posts/entities/shared-post';
import { User } from 'src/auth/entities/user.entity';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  SHARE = 'SHARE',
}

export class Notification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType | string;
  reference_id: string | null;
  read: boolean;

  actor?: Partial<User> | null;
  recipient?: Partial<User> | null;
  followedUser?: Partial<Follow> | null;
  likedComment?: Partial<Comment> | null;
  likedPost?: Partial<Post> | null;
  sharedPost?: Partial<SharedPost> | null;

  created_at: Date;
  updated_at: Date;
}
