import { User } from 'src/auth/entities/user.entity';
import { Media } from 'src/medias/entities/media.entity';

export class Post {
  id: string;
  content?: string | null;
  user_id: string;

  medias?: Media[];
  user?: User | null;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
