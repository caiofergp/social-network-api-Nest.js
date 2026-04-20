import { PasswordResetToken } from '../entities/passwordResetToken.entity';
import { User } from '../entities/user.entity';

export abstract class AuthRepository {
  abstract create(data: Omit<User, 'id'>): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByToken(token: string): Promise<User | null>;
  abstract update(id: string, data: Partial<User>): Promise<User>;
  abstract createPasswordResetToken(
    data: Omit<PasswordResetToken, 'id'>,
  ): Promise<PasswordResetToken>;
  abstract findPasswordResetTokenByToken(
    token: string,
  ): Promise<PasswordResetToken | null>;
  abstract updatePasswordResetToken(
    id: string,
    data: Partial<PasswordResetToken>,
  ): Promise<PasswordResetToken>;
  abstract deleteUnverifiedUsersWithExpiredTokens(
    limit: number,
  ): Promise<number>;
}
