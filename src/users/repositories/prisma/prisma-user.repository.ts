import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { User } from 'src/users/entities/user.entity';
import { UserWithoutRelations } from 'src/auth/repositories/auth.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
      },
      include: {
        avatar: true,
        cover: true,
      },
    });
  }

  async update(
    id: string,
    data: Partial<UserWithoutRelations>,
  ): Promise<Omit<User, 'password'>> {
    return await this.prisma.user.update({
      where: { id },
      data,
      omit: {
        password: true,
      },
      include: {
        avatar: true,
        cover: true,
      },
    });
  }
}
