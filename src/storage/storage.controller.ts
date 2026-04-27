import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { AuthGuard } from '../guards/auth.guard';
import {
  GetUploadUrlParamsDto,
  GetUploadUrlQueryDto,
} from './dto/get-upload-url.dto';
import type { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('upload-url/:modelType')
  @HttpCode(200)
  async getUploadUrl(
    @Req() req: Request,
    @Param() params: GetUploadUrlParamsDto,
    @Query() query: GetUploadUrlQueryDto,
  ) {
    return await this.storageService.getUploadUrl(
      req.user!,
      params.modelType,
      query.file,
    );
  }
}
