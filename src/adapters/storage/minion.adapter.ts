import { StorageAdapter } from './storage.adapter';
import * as Minio from 'minio';

export class MinionAdapter implements StorageAdapter {
  private static client: Minio.Client;
  private bucket: string = process.env.STORAGE_BUCKET!;

  constructor() {
    if (!MinionAdapter.client) {
      MinionAdapter.client = new Minio.Client({
        endPoint: process.env.STORAGE_ENDPOINT!,
        port: Number(process.env.STORAGE_PORT)!,
        useSSL: process.env.STORAGE_USE_SSL === 'true',
        accessKey: process.env.STORAGE_ACCESS_KEY!,
        secretKey: process.env.STORAGE_SECRET_KEY!,
        region: 'us-east-1',
      });
    }
  }

  private get client(): Minio.Client {
    return MinionAdapter.client;
  }

  async getUploadUrl(
    path: string,
    expiresIn: number = 3600,
    maxSizeInBytes: number = 5 * 1024 * 1024, // 5MB default
  ): Promise<any> {
    const policy = new Minio.PostPolicy();

    policy.setBucket(this.bucket);
    policy.setKey(path);
    policy.setContentLengthRange(0, maxSizeInBytes);

    const expires = new Date(Date.now() + expiresIn * 1000);
    policy.setExpires(expires);

    return await this.client.presignedPostPolicy(policy);
  }

  async moveObject(oldPath: string, newPath: string): Promise<void> {
    try {
      try {
        await this.client.statObject(this.bucket, oldPath);
      } catch (error) {
        try {
          await this.client.statObject(this.bucket, newPath);
          return;
        } catch (innerError) {
          throw new Error(`File not found in ${oldPath} or ${newPath}`);
        }
      }

      await this.client.copyObject(
        this.bucket,
        newPath,
        encodeURI(`/${this.bucket}/${oldPath}`),
      );

      await this.client.removeObject(this.bucket, oldPath);
    } catch (error) {
      console.error('Error moving object:', {
        bucket: this.bucket,
        oldPath,
        newPath,
        error: error.message,
      });
      throw error;
    }
  }
}
