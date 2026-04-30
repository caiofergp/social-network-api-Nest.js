import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PostRepository } from './repositories/post.repository';
import { PrismaPostRepository } from './repositories/prisma/prisma-post.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { MinionAdapter } from 'src/adapters/storage/minion.adapter';

import { PrismaModule } from 'src/db/prisma/prisma.module';
import { PostMediaRepository } from './repositories/post-media.repository';
import { PrismaPostMediaRepository } from './repositories/prisma/prisma-post-media.repositrory';
import { LikeRepository } from './repositories/like.repository';
import { PrismaLikeRepository } from './repositories/prisma/prisma-like-repository';
import { CommentRepository } from './repositories/comment.repository';
import { PrismaCommentRepository } from './repositories/prisma/prisma-comment.repository';
import { SharedPostRepository } from './repositories/shared-post.repository';
import { PrismaSharedPostRepository } from './repositories/prisma/prisma-shared-post.repository';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    { provide: PostRepository, useClass: PrismaPostRepository },
    { provide: PostMediaRepository, useClass: PrismaPostMediaRepository },
    { provide: StorageAdapter, useClass: MinionAdapter },
    { provide: LikeRepository, useClass: PrismaLikeRepository },
    { provide: CommentRepository, useClass: PrismaCommentRepository },
    { provide: SharedPostRepository, useClass: PrismaSharedPostRepository },
  ],
})
export class PostsModule {}
