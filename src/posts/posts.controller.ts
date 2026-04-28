import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import type { Request } from 'express';
import { UpdatePostDto } from './dto/update-post.dto';

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
}
