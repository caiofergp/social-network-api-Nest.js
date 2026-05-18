import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

class MediaDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  mime_type?: string;

  @IsOptional()
  size?: number;
}

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  chatId: string;

  @ValidateIf((payload) => !payload.medias)
  @IsString()
  content?: string;

  @ValidateIf((payload) => !payload.content)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  medias?: MediaDto[];
}
