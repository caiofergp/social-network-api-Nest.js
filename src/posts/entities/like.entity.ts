import { User } from 'src/auth/entities/user.entity';
import { Post } from './post.entity';

export class Like {
  user_id: string;
  post_id: string;

  post?: Post | null;
  user?: User | null;

  created_at: Date;
}
