import { IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator';

export class CreatePostCommentDto {
  @ValidateIf((o) => !!o.parent_id)
  @IsUUID()
  parent_id?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
