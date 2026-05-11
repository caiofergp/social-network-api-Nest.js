export abstract class StorageAdapter {
  abstract getDownloadUrl(path: string): Promise<string>;
  abstract getUploadUrl(
    path: string,
    expiresIn?: number,
    maxSize?: number,
  ): Promise<any>;
  abstract moveObject(oldPath: string, newPath: string): Promise<void>;
  abstract deleteObject(path: string): Promise<void>;
}
