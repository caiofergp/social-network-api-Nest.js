import { Injectable, NotFoundException } from '@nestjs/common';
import { Chat, ChatType } from 'src/chats/entities/chat.entity';
import { ChatsRepository, ChatsRepositoryOptions } from '../chats.repository';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { PaginationDto } from 'src/db/dto/pagination.dto';

@Injectable()
export class PrismaChatsRepository implements ChatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPrivateChat(
    participant1Id: string,
    participant2Id: string,
  ): Promise<Chat> {
    const participant2 = await this.prisma.db.user.findUnique({
      where: {
        id: participant2Id,
      },
      select: {
        name: true,
      },
    });

    if (!participant2) {
      throw new NotFoundException('Participant 2 not found');
    }

    return await this.prisma.db.chat.create({
      data: {
        type: ChatType.PRIVATE,
        name: participant2.name,
        members: {
          createMany: {
            data: [
              {
                user_id: participant1Id,
              },
              {
                user_id: participant2Id,
              },
            ],
          },
        },
      },
    });
  }

  async createGroupChat(membersId: string[], name: string): Promise<Chat> {
    return await this.prisma.db.chat.create({
      data: {
        type: ChatType.GROUP,
        name,
        members: {
          createMany: {
            data: membersId.map((memberId) => ({
              user_id: memberId,
            })),
          },
        },
      },
    });
  }

  async getChatById(
    chatId: string,
    options?: ChatsRepositoryOptions,
  ): Promise<Chat | null> {
    return await this.prisma.db.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        ...(options?.message
          ? {
              messages: {
                take: options.message.limit,
                skip: options.message.offset,
                orderBy: {
                  created_at: 'asc',
                },
                include: {
                  medias: true,
                },
              },
            }
          : {}),
      },
    });
  }

  async getUserChats(userId: string, offset = 0, limit = 20): Promise<Chat[]> {
    return await this.prisma.db.chat.findMany({
      where: {
        members: {
          some: {
            user_id: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            created_at: 'desc',
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        name: 'asc',
      },
    });
  }
}
