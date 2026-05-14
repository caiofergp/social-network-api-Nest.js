import { User } from 'src/auth/entities/user.entity';
import { Post } from './post.entity';

export class SharedPost {
  id: string;
  post_id: string;
  user_id: string;

  post?: Post | null;
  user?: User | null;

  created_at: Date;
}
