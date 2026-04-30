import { Like } from '../entities/like.entity';

export enum LikeReferenceType {
  POST = 'post',
  COMMENT = 'comment',
}

export abstract class LikeRepository {
  abstract create(
    referenceId: string,
    userId: string,
    type: LikeReferenceType,
  ): Promise<Like>;
  abstract delete(referenceId: string, userId: string): Promise<Like>;
}
