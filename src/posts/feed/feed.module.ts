import { Module } from '@nestjs/common';

import { FeedRepository } from './repositories/feed.repository';
import { PrismaFeedRepository } from './repositories/prisma/prisma-feed.repository';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/db/prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [
    FeedService,
    { provide: FeedRepository, useClass: PrismaFeedRepository },
  ],
  controllers: [FeedController],
  exports: [FeedService],
})
export class FeedModule {}
