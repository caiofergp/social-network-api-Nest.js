import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../auth.repository';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { User } from 'src/auth/entities/user.entity';
import { PasswordResetToken } from 'src/auth/entities/passwordResetToken.entity';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Omit<User, 'id'>) {
    return this.prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByToken(token: string) {
    return this.prisma.user.findUnique({
      where: { token },
    });
  }

  async update(id: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async createPasswordResetToken(data: Omit<PasswordResetToken, 'id'>) {
    return await this.prisma.passwordResetToken.create({
      data,
    });
  }

  async updatePasswordResetToken(
    id: string,
    data: Partial<PasswordResetToken>,
  ) {
    return await this.prisma.passwordResetToken.update({
      where: { id },
      data,
    });
  }

  async findPasswordResetTokenByToken(token: string) {
    return await this.prisma.passwordResetToken.findUnique({
      where: { token },
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
