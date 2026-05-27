import { Module } from '@nestjs/common';

import { FeedRepository } from './repositories/feed.repository';
import { PrismaFeedRepository } from './repositories/prisma/prisma-feed.repository';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/db/prisma/prisma.module';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { MinionAdapter } from 'src/adapters/storage/minion.adapter';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [
    FeedService,
    { provide: FeedRepository, useClass: PrismaFeedRepository },
    { provide: StorageAdapter, useClass: MinionAdapter },
  ],
  controllers: [FeedController],
  exports: [FeedService],
})
export class FeedModule {}
