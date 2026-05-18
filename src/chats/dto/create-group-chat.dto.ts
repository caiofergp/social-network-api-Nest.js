import { ArrayNotEmpty, IsArray, IsString, MinLength } from 'class-validator';

export class CreateGroupChatDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  membersId: string[];
}
