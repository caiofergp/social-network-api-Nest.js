import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthRepository } from './repositories/auth.repository';
import { HashAdapter } from '../adapters/hash/hash.adapter';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';
import { DateManagerAdapter } from 'src/adapters/date-manager/date-manager.adapter';
import { resetPasswordFormTemplate } from '../templates/reset-password-form.template';
import { accountConfirmPageTemplate } from 'src/templates/account-confirm-page.template';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private passwordResetTokenRepository: PasswordResetTokenRepository,
    private hashAdapter: HashAdapter,
    private jwtService: JwtService,
    private mailService: MailService,
    private dateManager: DateManagerAdapter,
  ) {}

  async signin(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.authRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.email_verified_at) {
      throw new NotFoundException('User not verified');
    }

    const isPasswordValid = await this.hashAdapter.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const token = await this.jwtService.signAsync({ id: user.id });

    return token;
  }

  async signup(createAuthDto: SignUpDto) {
    const { name, email, password } = createAuthDto;

    const user = await this.authRepository.findOne({ email });

    if (user) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.hashAdapter.hash(password);

    const rawToken = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = this.dateManager.addDays(this.dateManager.now(), 1);

    const createdUser = await this.authRepository.create({
      name,
      email,
      password: hashedPassword,
      token: tokenHash,
      expires_at: expiresAt,
    });

    await this.mailService.sendConfirmAccountEmail(createdUser, rawToken);
  }

  async confirmAccount(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.authRepository.findOne({ token: tokenHash });

    if (!user) {
      return accountConfirmPageTemplate(false);
    }

    if (!user?.expires_at || user.expires_at < this.dateManager.now()) {
      return accountConfirmPageTemplate(false);
    }

    await this.authRepository.update(user.id, {
      email_verified_at: this.dateManager.now(),
      token: null,
      expires_at: null,
    });

    return accountConfirmPageTemplate(true);
  }

  async resetPasswordRequest(email: string) {
    const user = await this.authRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = this.dateManager.addHours(this.dateManager.now(), 1);

    await this.passwordResetTokenRepository.create({
      token: tokenHash,
      expires_at: expiresAt,
      user_id: user.id,
      used_at: null,
    });

    await this.mailService.sendResetPasswordEmail(user, rawToken, expiresAt);
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const passwordResetToken = await this.passwordResetTokenRepository.findOne({
      token: tokenHash,
    });

    if (!passwordResetToken) {
      throw new BadRequestException('Invalid token');
    }

    if (passwordResetToken.expires_at < this.dateManager.now()) {
      throw new BadRequestException('Token expired');
    }

    if (passwordResetToken.used_at) {
      throw new BadRequestException('Token already used');
    }

    const hashedPassword = await this.hashAdapter.hash(password);

    await this.authRepository.update(passwordResetToken.user_id, {
      password: hashedPassword,
    });

    await this.passwordResetTokenRepository.update(passwordResetToken.id, {
      used_at: this.dateManager.now(),
    });
  }

  async resetPasswordPage(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const passwordResetToken = await this.passwordResetTokenRepository.findOne({
      token: tokenHash,
    });

    if (!passwordResetToken) {
      throw new BadRequestException('Invalid token');
    }

    if (passwordResetToken.expires_at < this.dateManager.now()) {
      return resetPasswordFormTemplate(token, false);
    }

    if (passwordResetToken.used_at) {
      return resetPasswordFormTemplate(token, false);
    }

    return resetPasswordFormTemplate(token);
  }
}
