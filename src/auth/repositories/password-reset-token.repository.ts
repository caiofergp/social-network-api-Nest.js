import { PasswordResetToken } from '../entities/passwordResetToken.entity';

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
