import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { FollowRepository } from './repositories/follow.repository';
import { PrismaFollowRepository } from './repositories/prisma/prisma-follow.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
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
