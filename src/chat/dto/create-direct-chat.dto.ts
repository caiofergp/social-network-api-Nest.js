import { IsString } from 'class-validator';

export class CreateDirectChatDto {
  @IsString()
  readonly participantId: string;
}
