import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { MessageRepository } from '../message.repository';

@Injectable()
export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(senderId: string, chatId: string, content?: string) {
    return await this.prisma.db.message.create({
      data: {
        sender_id: senderId,
        chat_id: chatId,
        content,
      },
      include: {
        medias: true,
      },
    });
  }
}
