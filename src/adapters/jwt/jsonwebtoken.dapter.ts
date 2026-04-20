import { GenerateTokenOptions, JwtAdapter } from './jwt.dapter';
import jwt from 'jsonwebtoken';

export class JsonwebtokenAdapter implements JwtAdapter {
  async generateToken(
    payload: any,
    options: GenerateTokenOptions = { expiresIn: '7d' },
  ): Promise<string> {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(payload, secret, {
      expiresIn: options?.expiresIn as any,
    });
  }

  async verifyToken(token: string): Promise<any> {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.verify(token, secret);
  }
}
