import { Post } from './post.entity';
import { User } from 'src/auth/entities/user.entity';

export class Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;

  user?: User | null;
  post?: Post | null;
  children?: Comment[] | null;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
