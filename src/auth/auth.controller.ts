import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpCode,
  Get,
  Param,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signup(@Body() createAuthDto: SignUpDto) {
    await this.authService.signup(createAuthDto);

    return {
      message: 'User created successfully',
    };
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.signin(signInDto);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
    });

    return {
      token,
    };
  }

  @Get('confirm-account/:token')
  async confirmAccount(@Param('token') token: string) {
    return await this.authService.confirmAccount(token);
  }

  @Post('reset-password-request')
  async resetPasswordRequest(@Body() { email }: { email: string }) {
    await this.authService.resetPasswordRequest(email);

    return {
      message: 'Reset password request sent successfully',
    };
  }

  @Get('reset-password/:token')
  async validateResetPasswordToken(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    const html = await this.authService.resetPasswordPage(token);
    return res.type('html').send(html);
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() { password }: { password: string },
  ) {
    await this.authService.resetPassword(token, password);

    return {
      message: 'Password reset successfully',
    };
  }
}
