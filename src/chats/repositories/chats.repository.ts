import { Chat } from '../entities/chat.entity';

export type ChatsRepositoryOptions = {
  message?: {
    limit?: number;
    offset?: number;
  };
};

export abstract class ChatsRepository {
  abstract createPrivateChat(
    participant1Id: string,
    participant2Id: string,
  ): Promise<Chat>;
  abstract createGroupChat(membersId: string[], name: string): Promise<Chat>;
  abstract getChatById(
    chatId: string,
    options?: ChatsRepositoryOptions,
  ): Promise<Chat | null>;
  abstract getUserChats(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<Chat[]>;
}
