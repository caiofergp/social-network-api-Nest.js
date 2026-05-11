import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return this.usersService.getUserProfile(req.user!.id);
  }

  @Get(':id')
  getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  updateProfile(
    @Req() req: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user!.id, updateProfileDto);
  }
}
