import { Controller, Post, Param, Delete } from '@nestjs/common';
import { FollowsService } from './follows.service';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

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
