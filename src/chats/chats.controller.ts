import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { PaginationDto } from 'src/db/dto/pagination.dto';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import type { Request } from 'express';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';

@UseGuards(AuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get('user/:userId')
  async getUserChats(
    @Param('userId') userId: string,
    @Query() query: PaginationDto,
  ) {
    return await this.chatsService.getUserChats(
      userId,
      query.offset,
      query.limit,
    );
  }

  @Get(':id')
  async getChatById(@Param('id') id: string, @Query() query: PaginationDto) {
    return await this.chatsService.getChatById(id, query.offset, query.limit);
  }

  @Post('private')
  async createPrivateChat(
    @Body() createChatDto: CreateDirectChatDto,
    @Req() req: Request,
  ) {
    return await this.chatsService.createPrivateChat(
      req.user!.id,
      createChatDto.participantId,
    );
  }

  @Post('group')
  async createGroupChat(@Body() createChatDto: CreateGroupChatDto) {
    return await this.chatsService.createGroupChat(
      createChatDto.membersId,
      createChatDto.name,
    );
  }
}
