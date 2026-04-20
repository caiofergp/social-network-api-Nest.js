import { Controller, Post, Param, Delete, Get } from '@nestjs/common';
import { FollowsService } from './follows.service';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get('followers/:userId')
  getFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get('following/:userId')
  getFollowing(@Param('userId') userId: string) {
    return this.followsService.getFollowing(userId);
  }

  @Post('follow/:followerId/:followingId')
  follow(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.followsService.follow(followerId, followingId);
  }

  @Delete('unfollow/:followerId/:followingId')
  unfollow(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.followsService.unfollow(followerId, followingId);
  }
}
