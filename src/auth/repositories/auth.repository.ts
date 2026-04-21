import { User } from '../entities/user.entity';

export abstract class AuthRepository {
  abstract create(data: Omit<User, 'id'>): Promise<User>;
  abstract findOne(where: Partial<User>): Promise<User | null>;
  abstract update(id: string, data: Partial<User>): Promise<User>;
  abstract deleteUnverifiedUsersWithExpiredTokens(
    limit: number,
  ): Promise<number>;
}
