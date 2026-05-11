import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { UserRepository } from './repositories/user.repository';
import { PrismaUserRepository } from './repositories/prisma/prisma-user.repository';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { PrismaMediaRepository } from 'src/medias/repositories/prisma/prisma-media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { MinionAdapter } from 'src/adapters/storage/minion.adapter';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: MediaRepository, useClass: PrismaMediaRepository },
    { provide: StorageAdapter, useClass: MinionAdapter },
  ],
  exports: [UserRepository, UsersService],
})
export class UsersModule {}
