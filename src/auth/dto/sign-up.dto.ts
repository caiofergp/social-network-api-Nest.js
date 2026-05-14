import { IsEmail, IsString, MinLength } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class SignUpDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(8)
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
