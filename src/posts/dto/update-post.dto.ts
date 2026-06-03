import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class UpdateMediaContent {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class UpdatePostContent {
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  id?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdatePostDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMediaContent)
  medias?: UpdateMediaContent[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdatePostContent)
  post?: UpdatePostContent;
}
