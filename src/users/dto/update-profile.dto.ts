import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  ValidateNested,
  IsDateString,
  IsUrl,
} from 'class-validator';

export class ProfileMediaContent {
  @IsString()
  path: string;

  @IsString()
  mime_type: string;

  @IsOptional()
  size?: number;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileMediaContent)
  avatar?: ProfileMediaContent;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileMediaContent)
  cover?: ProfileMediaContent;
}
