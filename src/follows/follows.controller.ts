import {
  Controller,
  Post,
  Param,
  Delete,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import type { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
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

  @Post('follow/:followingId')
  follow(@Req() req: Request, @Param('followingId') followingId: string) {
    return this.followsService.follow(req.user!, followingId);
  }

  @Delete('unfollow/:followingId')
  unfollow(@Req() req: Request, @Param('followingId') followingId: string) {
    return this.followsService.unfollow(req.user!, followingId);
  }
}
