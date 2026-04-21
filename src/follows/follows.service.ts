import { Injectable } from '@nestjs/common';
import { FollowRepository } from './repositories/follow.repository';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class FollowsService {
  constructor(private readonly followRepository: FollowRepository) {}

  async follow(user: User, followingId: string) {
    await this.followRepository.create(user.id, followingId);
  }

  async unfollow(user: User, followingId: string) {
    await this.followRepository.delete(user.id, followingId);
  }

  async getFollowers(userId: string) {
    return this.followRepository.findMany({ following_id: userId });
  }

  async getFollowing(userId: string) {
    return this.followRepository.findMany({ follower_id: userId });
  }
}
