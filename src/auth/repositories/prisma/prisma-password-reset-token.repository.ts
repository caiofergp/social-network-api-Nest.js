import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { PasswordResetToken } from 'src/auth/entities/passwordResetToken.entity';
import { PasswordResetTokenRepository } from '../password-reset-token.repository';

@Injectable()
export class PrismaPasswordResetTokenRepository
  implements PasswordResetTokenRepository
{
  constructor(private prisma: PrismaService) {}

  async create(data: Omit<PasswordResetToken, 'id'>) {
    return await this.prisma.passwordResetToken.create({
      data,
    });
  }

  async findOne(where: Partial<PasswordResetToken>) {
    return await this.prisma.passwordResetToken.findFirst({
      where,
    });
  }

  async update(id: string, data: Partial<PasswordResetToken>) {
    return await this.prisma.passwordResetToken.update({
      where: { id },
      data,
    });
  }
}
