import { OmitType } from '@nestjs/mapped-types';
import { CreatePostCommentDto } from './create-post-comment.dto';

export class UpdatePostCommentDto extends OmitType(CreatePostCommentDto, [
  'parent_id',
]) {}
