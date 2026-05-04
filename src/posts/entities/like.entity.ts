import { User } from 'src/auth/entities/user.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';

export class Like {
  id: string;
  user_id: string;
  reference_id: string;
  type: string;

  user?: User | null;
  post?: Post | null;
  comment?: Comment | null;

  created_at: Date;
}
