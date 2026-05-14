import { BadRequestException, Injectable } from '@nestjs/common';
import { FollowRepository } from './repositories/follow.repository';
import { User } from 'src/auth/entities/user.entity';
import { PrismaErrorCode } from 'src/db/prisma/prisma-error-code';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseNotificationPayload } from 'src/notifications/notifications.listener';

@Injectable()
export class FollowsService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async follow(user: User, followingId: string) {
    const followed = await this.followRepository
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

    this.eventEmitter.emit(
      'follow.created',
      new BaseNotificationPayload({
        actorId: user.id,
        actorName: user.name,
        recipientId: followingId,
        referenceId: followed.id,
      }),
    );

    return followed;
  }

  async unfollow(id: string) {
    return await this.followRepository.delete(id).catch((error) => {
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
