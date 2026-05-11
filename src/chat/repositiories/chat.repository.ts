import { Chat } from '../entities/chat.entity';
import { PaginationDto } from 'src/db/dto/pagination.dto';

export type ChatRepositoryOptions = {
  message?: PaginationDto;
};

export abstract class ChatRepository {
  abstract createPrivateChat(
    participant1Id: string,
    participant2Id: string,
  ): Promise<Chat>;
  abstract createGroupChat(membersId: string[], name: string): Promise<Chat>;
  abstract getChatById(
    chatId: string,
    options?: ChatRepositoryOptions,
  ): Promise<Chat | null>;
  abstract getUserChats(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<Chat[]>;
}
