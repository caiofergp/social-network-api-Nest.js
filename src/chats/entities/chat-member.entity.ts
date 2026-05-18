import { User } from 'src/auth/entities/user.entity';
import { Chat } from './chat.entity';

export class ChatMember {
  id: string;
  user_id: string;
  chat_id: string;

  user?: Partial<User> | null;
  chat?: Chat | null;

  created_at: Date;
  updated_at: Date;
}
