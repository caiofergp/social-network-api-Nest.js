import { User } from '../entities/user.entity';

export type UserWithoutRelations = Omit<User, 'avatar' | 'cover'>;

export abstract class AuthRepository {
  abstract create(data: Omit<UserWithoutRelations, 'id'>): Promise<User>;
  abstract findOne(where: Partial<User>): Promise<User | null>;
  abstract update(
    id: string,
    data: Partial<UserWithoutRelations>,
  ): Promise<User>;
  abstract deleteUnverifiedUsersWithExpiredTokens(
    limit: number,
  ): Promise<number>;
}
