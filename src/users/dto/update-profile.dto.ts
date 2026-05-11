import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  ValidateNested,
  IsDateString,
  IsUrl,
  IsEnum,
} from 'class-validator';

enum ProfileMediaContentTypes {
  AVATAR = 'AVATAR',
  COVER = 'COVER',
}

export class ProfileMediaContent {
  @IsString()
  path: string;

  @IsEnum(ProfileMediaContentTypes)
  type: ProfileMediaContentTypes;

  @IsString()
  mime_type: string;

  @IsOptional()
  size?: number;
}

export class UpdateProfileDto {
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
