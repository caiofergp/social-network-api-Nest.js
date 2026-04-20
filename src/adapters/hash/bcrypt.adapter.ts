import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashAdapter } from './hash.adapter';

@Injectable()
export class BcryptAdapter implements HashAdapter {
  private readonly saltRounds = Number(process.env.SALT_ROUNDS);

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
