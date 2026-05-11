import { IsEnum, IsString } from 'class-validator';

export enum StorageModel {
  POST = 'POST',
  PROFILE = 'PROFILE',
  COMMENT = 'COMMENT',
  MESSAGE = 'MESSAGE',
}

export class GetUploadUrlParamsDto {
  @IsEnum(StorageModel)
  modelType: StorageModel;
}

export class GetUploadUrlQueryDto {
  @IsString()
  file: string;
}
