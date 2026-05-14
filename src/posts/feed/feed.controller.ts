import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { FeedService } from './feed.service';
import { PaginationDto } from 'src/db/dto/pagination.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import type { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('posts/feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('/followed-user-posts')
  getFollowedUserPosts(@Req() req: Request, @Query() query: PaginationDto) {
    return this.feedService.getFollowedUserPosts(req.user!.id, query);
  }

  @Get('/recommended')
  getRecommendedFeed(@Req() req: Request, @Query() query: PaginationDto) {
    return this.feedService.getRecommendedFeed(req.user!.id, query);
  }
}
