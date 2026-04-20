import { Injectable } from '@nestjs/common';
import { FollowRepository } from './repositories/follow.repository';

@Injectable()
export class FollowsService {
  constructor(private readonly followRepository: FollowRepository) {}

  async follow(followerId: string, followingId: string) {
    await this.followRepository.create(followerId, followingId);
  }

  async unfollow(followerId: string, followingId: string) {
    await this.followRepository.delete(followerId, followingId);
  }

  async getFollowers(userId: string) {
    return this.followRepository.findMany({ followingId: userId });
  }

  async getFollowing(userId: string) {
    return this.followRepository.findMany({ followerId: userId });
  }
}
