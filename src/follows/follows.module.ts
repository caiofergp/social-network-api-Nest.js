import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { FollowRepository } from './repositories/follow.repository';
import { PrismaFollowRepository } from './repositories/prisma/prisma-follow.repository';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { JwtAdapter } from 'src/adapters/jwt/jwt.dapter';
import { JsonwebtokenAdapter } from 'src/adapters/jwt/jsonwebtoken.dapter';
import { AuthRepository } from 'src/auth/repositories/auth.repository';
import { PrismaAuthRepository } from 'src/auth/repositories/prisma/prisma-auth.repository';

@Module({
  controllers: [FollowsController],
  providers: [
    FollowsService,
    {
      provide: FollowRepository,
      useClass: PrismaFollowRepository,
    },
    {
      provide: JwtAdapter,
      useClass: JsonwebtokenAdapter,
    },
    {
      provide: AuthRepository,
      useClass: PrismaAuthRepository,
    },
  ],
})
export class FollowsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('follows');
  }
}
