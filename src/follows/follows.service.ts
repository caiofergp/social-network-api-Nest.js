import { BadRequestException, Injectable } from '@nestjs/common';
import { FollowRepository } from './repositories/follow.repository';
import { User } from 'src/auth/entities/user.entity';
import { PrismaErrorCode } from 'src/db/prisma/prisma-erro-code';

@Injectable()
export class FollowsService {
  constructor(private readonly followRepository: FollowRepository) {}

  async follow(user: User, followingId: string) {
    return await this.followRepository
      .create(user.id, followingId)
      .catch((error) => {
        if (error.code === PrismaErrorCode.uniqueConstraint) {
          throw new BadRequestException('You are already following this user');
        }

        if (error.code === PrismaErrorCode.foreignKey) {
          throw new BadRequestException('User does not exist');
        }

        throw error;
      });
  }

  async unfollow(user: User, followingId: string) {
    return await this.followRepository
      .delete(user.id, followingId)
      .catch((error) => {
        if (error.code === PrismaErrorCode.notFound) {
          throw new BadRequestException('You are not following this user');
        }

        throw error;
      });
  }

  async getFollowers(userId: string) {
    return this.followRepository.findMany({ following_id: userId });
  }

  async getFollowing(userId: string) {
    return this.followRepository.findMany({ follower_id: userId });
  }
}
