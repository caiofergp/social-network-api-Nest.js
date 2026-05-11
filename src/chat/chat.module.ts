import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtAdapter } from 'src/adapters/jwt/jwt.dapter';
import { JsonwebtokenAdapter } from 'src/adapters/jwt/jsonwebtoken.dapter';
import { ChatService } from './chat.service';
import { MessageRepository } from './repositiories/message.repository';
import { PrismaMessageRepository } from './repositiories/prisma/prisma-message.repository';
import { ChatRepository } from './repositiories/chat.repository';
import { PrismaChatRepository } from './repositiories/prisma/prisma-chat.repository';
import { ChatController } from './chat.controller';
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
    ChatGateway,
    ChatService,
    { provide: JwtAdapter, useClass: JsonwebtokenAdapter },
    { provide: MessageRepository, useClass: PrismaMessageRepository },
    { provide: ChatRepository, useClass: PrismaChatRepository },
    { provide: MediaRepository, useClass: PrismaMediaRepository },
    { provide: StorageAdapter, useClass: MinionAdapter },
    { provide: UnitOfWork, useClass: PrismaUnitOfWork },
  ],
  controllers: [ChatController],
})
export class ChatModule {}
