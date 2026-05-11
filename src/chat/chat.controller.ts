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
import { ChatService } from './chat.service';
import { PaginationDto } from 'src/db/dto/pagination.dto';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import type { Request } from 'express';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';

@UseGuards(AuthGuard)
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('user/:userId')
  async getUserChats(
    @Param('userId') userId: string,
    @Query() query: PaginationDto,
  ) {
    return await this.chatService.getUserChats(
      userId,
      query.offset,
      query.limit,
    );
  }

  @Get(':id')
  async getChatById(@Param('id') id: string, @Query() query: PaginationDto) {
    return await this.chatService.getChatById(id, query.offset, query.limit);
  }

  @Post('private')
  async createPrivateChat(
    @Body() createChatDto: CreateDirectChatDto,
    @Req() req: Request,
  ) {
    return await this.chatService.createPrivateChat(
      req.user!.id,
      createChatDto.participantId,
    );
  }

  @Post('group')
  async createGroupChat(@Body() createChatDto: CreateGroupChatDto) {
    return await this.chatService.createGroupChat(
      createChatDto.membersId,
      createChatDto.name,
    );
  }
}
