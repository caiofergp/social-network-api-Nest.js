import { Media } from '../entities/media.entity';

type CreateMedia = 'id' | 'created_at' | 'updated_at' | 'deleted_at';

export abstract class MediaRepository {
  abstract findByIdNotIn(ids: string[], entityId: string): Promise<Media[]>;
  abstract create(data: Omit<Media, CreateMedia>): Promise<Media>;
  abstract createMany(data: Omit<Media, CreateMedia>[]): Promise<Media[]>;
  abstract deleteMany(ids: string[]): Promise<void>;
}
