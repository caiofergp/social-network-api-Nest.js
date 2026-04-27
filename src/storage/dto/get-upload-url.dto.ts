import { IsEnum, IsString } from 'class-validator';

export enum StorageModel {
  POST = 'post',
  PROFILE = 'profile',
}

export class GetUploadUrlParamsDto {
  @IsEnum(StorageModel)
  modelType: StorageModel;
}

export class GetUploadUrlQueryDto {
  @IsString()
  file: string;
}
