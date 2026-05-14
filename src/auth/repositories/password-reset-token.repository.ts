import { PasswordResetToken } from '../entities/password-reset-token.entity';

export abstract class PasswordResetTokenRepository {
  abstract create(
    data: Omit<PasswordResetToken, 'id'>,
  ): Promise<PasswordResetToken>;
  abstract findOne(
    where: Partial<PasswordResetToken>,
  ): Promise<PasswordResetToken | null>;
  abstract update(
    id: string,
    data: Partial<PasswordResetToken>,
  ): Promise<PasswordResetToken>;
}
