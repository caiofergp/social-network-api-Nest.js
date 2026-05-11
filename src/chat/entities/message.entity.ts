import { User } from 'src/auth/entities/user.entity';
import { Chat } from './chat.entity';
import { Media } from 'src/medias/entities/media.entity';

export class Message {
  id: string;
  sender_id: string;
  chat_id: string;
  content?: string | null;

  user?: Partial<User>;
  chat?: Chat;
  medias?: Media[];

  created_at: Date;
  updated_at: Date;
}
