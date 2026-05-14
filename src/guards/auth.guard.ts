import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/repositories/auth.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const token: string | undefined = req.cookies?.token;

    if (!token) {
      return false;
    }

    const decodedToken: { id: string } =
      await this.jwtService.verifyAsync(token);
    const user = await this.authRepository.findOne({ id: decodedToken.id });

    if (!user) {
      return false;
    }

    req.user = user;

    return true;
  }
}
