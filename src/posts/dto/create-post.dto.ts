import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsObject,
  ValidateIf,
  ValidateNested,
  IsArray,
} from 'class-validator';

export class MediaContent {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class PostContent {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreatePostDto {
  @ValidateIf((o) => !o.post?.content)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaContent)
  medias?: MediaContent[];

  @ValidateIf((o) => !o.medias?.length)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => PostContent)
  post?: PostContent;
}
