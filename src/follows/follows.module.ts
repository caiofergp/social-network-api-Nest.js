import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { FollowRepository } from './repositories/follow.repository';
import { PrismaFollowRepository } from './repositories/prisma/prisma-follow.repository';

@Module({
  controllers: [FollowsController],
  providers: [
    FollowsService,
    {
      provide: FollowRepository,
      useClass: PrismaFollowRepository,
    },
  ],
})
export class FollowsModule {}
