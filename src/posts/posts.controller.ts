import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Patch,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import type { Request } from 'express';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { PaginationDto } from '../db/dto/pagination.dto';

@UseGuards(AuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    return this.postsService.create(createPostDto, req.user?.id!);
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: Request,
  ) {
    return this.postsService.update(updatePostDto, id, req.user?.id!);
  }

  @Delete('/:id')
  delete(@Param('id') id: string, @Req() req: Request) {
    return this.postsService.delete(id, req.user?.id!);
  }

  @Post('/:id/like')
  like(@Param('id') id: string, @Req() req: Request) {
    return this.postsService.addLike(id, req.user?.id!);
  }

  @Delete('/:id/like')
  unlike(@Param('id') id: string, @Req() req: Request) {
    return this.postsService.deleteLike(id, req.user?.id!);
  }

  @Get('/:id/comments')
  getComments(@Param('id') id: string, @Query() query: PaginationDto) {
    return this.postsService.getPostComments(id, query);
  }

  @Get('/comments/:commentId/children')
  getCommentsChildren(
    @Param('commentId') commentId: string,
    @Query() query: PaginationDto,
  ) {
    return this.postsService.getPostCommentsChildren(commentId, query);
  }

  @Post('/:id/comments')
  addComment(
    @Param('id') id: string,
    @Body() data: CreatePostCommentDto,
    @Req() req: Request,
  ) {
    return this.postsService.addComment(id, data, req.user?.id!);
  }

  @Patch('/comments/:commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @Body() data: UpdatePostCommentDto,
    @Req() req: Request,
  ) {
    return this.postsService.updateComment(commentId, data, req.user?.id!);
  }

  @Delete('/comments/:commentId')
  deleteComment(@Param('commentId') commentId: string, @Req() req: Request) {
    return this.postsService.deleteComment(commentId, req.user?.id!);
  }
}
