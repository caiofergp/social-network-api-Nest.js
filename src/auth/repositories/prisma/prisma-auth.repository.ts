import { Injectable } from '@nestjs/common';
import { AuthRepository, UserWithoutRelations } from '../auth.repository';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { User } from 'src/auth/entities/user.entity';
import { PasswordResetToken } from 'src/auth/entities/passwordResetToken.entity';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Omit<UserWithoutRelations, 'id'>) {
    return await this.prisma.user.create({
      data,
    });
  }

  async findOne(where: Partial<User>) {
    return await this.prisma.user.findFirst({
      where,
    });
  }

  async update(id: string, data: Partial<UserWithoutRelations>) {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUnverifiedUsersWithExpiredTokens(limit: number) {
    const userCount = await this.prisma.user.count({
      where: {
        email_verified_at: null,
        expires_at: {
          lt: new Date(),
        },
      },
    });

    if (userCount === 0) return 0;

    let deletedUsers = 0;

    while (deletedUsers < userCount) {
      const usersToDelete = await this.prisma.user.findMany({
        where: {
          email_verified_at: null,
          expires_at: {
            lt: new Date(),
          },
        },
        select: { id: true },
        take: limit,
      });

      if (usersToDelete.length === 0) break;

      await this.prisma.user.deleteMany({
        where: {
          id: { in: usersToDelete.map((user) => user.id) },
        },
      });

      deletedUsers += usersToDelete.length;
    }

    return deletedUsers;
  }
}
