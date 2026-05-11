import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export abstract class UserRepository {
  abstract getUserById(id: string): Promise<Omit<User, 'password'> | null>;
  abstract update(id: string, data: Partial<User>): Promise<Omit<User, 'password'>>;
}
