import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtAdapter } from 'src/adapters/jwt/jwt.dapter';
import { AuthRepository } from 'src/auth/repositories/auth.repository';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtAdapter: JwtAdapter,
    private readonly authRepository: AuthRepository,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const decodedToken: { id: string } =
        await this.jwtAdapter.verifyToken(token);
      const user = await this.authRepository.findOne({ id: decodedToken.id });

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
}
