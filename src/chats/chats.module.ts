import { Module } from '@nestjs/common';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { MessageRepository } from './repositories/message.repository';
import { PrismaMessageRepository } from './repositories/prisma/prisma-message.repository';
import { ChatsRepository } from './repositories/chats.repository';
import { PrismaChatsRepository } from './repositories/prisma/prisma-chats.repository';
import { ChatsController } from './chats.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { PrismaMediaRepository } from 'src/medias/repositories/prisma/prisma-media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { MinionAdapter } from 'src/adapters/storage/minion.adapter';
import { UnitOfWork } from 'src/db/unit-of-work';
import { PrismaUnitOfWork } from 'src/db/prisma/prisma-unit-of-work';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [
    ChatsGateway,
    ChatsService,
    { provide: MessageRepository, useClass: PrismaMessageRepository },
    { provide: ChatsRepository, useClass: PrismaChatsRepository },
    { provide: MediaRepository, useClass: PrismaMediaRepository },
    { provide: StorageAdapter, useClass: MinionAdapter },
    { provide: UnitOfWork, useClass: PrismaUnitOfWork },
  ],
  controllers: [ChatsController],
})
export class ChatsModule {}
