import { IsEnum, IsString } from 'class-validator';

export enum StorageModel {
  POST = 'post',
  PROFILE = 'profile',
  COMMENT = 'comment',
  MESSAGE = 'message',
}

export class GetUploadUrlParamsDto {
  @IsEnum(StorageModel)
  modelType: StorageModel;
}

export class GetUploadUrlQueryDto {
  @IsString()
  file: string;
}
