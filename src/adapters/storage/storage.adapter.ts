export abstract class StorageAdapter {
  abstract getUploadUrl(
    path: string,
    expiresIn?: number,
    maxSize?: number,
  ): Promise<any>;
  abstract moveObject(oldPath: string, newPath: string): Promise<void>;
  abstract deleteObject(path: string): Promise<void>;
}
