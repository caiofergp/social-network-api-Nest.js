import { Injectable } from '@nestjs/common';
import { StorageAdapter } from '../adapters/storage/storage.adapter';
import { StorageModel } from './dto/get-upload-url.dto';
import { User } from 'src/auth/entities/user.entity';

import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  constructor(private readonly storageAdapter: StorageAdapter) {}

  async getUploadUrl(
    user: User,
    modelType: StorageModel,
    fileName: string,
    expiresIn: number = 3600,
    maxSizeInBytes: number = 5 * 1024 * 1024,
  ): Promise<{ url: any; path: string }> {
    const fileExtension = fileName.split('.').pop();

    const path = `tmp/users/${user.id}/${modelType}s/${crypto.randomUUID()}.${fileExtension}`;
    const url = await this.storageAdapter.getUploadUrl(
      path,
      expiresIn,
      maxSizeInBytes,
    );

    return { url, path };
  }
}
