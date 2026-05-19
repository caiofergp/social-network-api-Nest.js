import { Injectable, BadRequestException } from '@nestjs/common';
import { MessageRepository } from './repositories/message.repository';
import { ChatsRepository } from './repositories/chats.repository';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { Media } from 'src/medias/entities/media.entity';
import { UnitOfWork } from 'src/db/unit-of-work';

@Injectable()
export class ChatsService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatsRepository: ChatsRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly storageAdapter: StorageAdapter,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async saveMessage(
    senderId: string,
    chatId: string,
    content?: string,
    medias?: {
      path: string;
      type: string;
      mime_type?: string;
      size?: number;
    }[],
  ) {
    return await this.unitOfWork.runInTransaction(async () => {
      const message = await this.messageRepository.saveMessage(
        senderId,
        chatId,
        content,
      );

      if (medias && medias.length > 0) {
        const invalidPaths = !medias.every((media) =>
          media.path.startsWith(`tmp/users/${senderId}`),
        );

        if (invalidPaths) {
          throw new BadRequestException('Invalid path');
        }

        const mediaWithPaths = medias.map((media) => {
          const newPath = media.path.replace(
            `tmp/users/${senderId}`,
            `public/users/${senderId}`,
          );

          return {
            media: {
              ...media,
              path: newPath,
              entity_id: message.id,
              entity_type: 'MESSAGE',
              user_id: senderId,
              mime_type: media.mime_type || media.type,
            },
            oldPath: media.path,
            newPath,
          };
        });

        const createdMedias = await this.mediaRepository.createMany(
          mediaWithPaths.map((m) => m.media as Media),
        );

        await Promise.all(
          mediaWithPaths.map((media) =>
            this.storageAdapter.moveObject(media.oldPath, media.newPath),
          ),
        );

        message.medias = createdMedias;
      }

      return message;
    });
  }

  async createPrivateChat(participant1Id: string, participant2Id: string) {
    return await this.chatsRepository.createPrivateChat(
      participant1Id,
      participant2Id,
    );
  }

  async createGroupChat(membersId: string[], name: string) {
    return await this.chatsRepository.createGroupChat(membersId, name);
  }

  async getChatById(chatId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    return await this.chatsRepository.getChatById(chatId, {
      message: { offset, limit },
    });
  }

  async getUserChats(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    return await this.chatsRepository.getUserChats(userId, offset, limit);
  }
}
