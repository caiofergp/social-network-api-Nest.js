import { ChatMember } from './chat-members.entity';
import { Message } from './message.entity';

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
}

export class Chat {
  id: string;
  name?: string | null;
  type: string;

  members?: ChatMember[] | null;
  messages?: Message[] | null;

  created_at: Date;
  updated_at: Date;
}
