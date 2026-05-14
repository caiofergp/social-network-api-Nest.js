import { Message } from '../entities/message.entity';

export abstract class MessageRepository {
  abstract saveMessage(
    senderId: string,
    chatId: string,
    content?: string,
  ): Promise<Message>;
}
