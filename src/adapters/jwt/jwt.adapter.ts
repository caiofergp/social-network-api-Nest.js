export interface GenerateTokenOptions {
  expiresIn?: string;
}

export abstract class JwtAdapter {
  abstract generateToken(
    payload: any,
    options?: GenerateTokenOptions,
  ): Promise<string>;
  abstract verifyToken(token: string): Promise<any>;
}
