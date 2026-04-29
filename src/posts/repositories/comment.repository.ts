import { Comment } from '../entities/comment.entity';

export type CreateCommentData = {
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
};

export type UpdateCommentData = CreateCommentData & {
  id: string;
};

export type CommentResponse = {
  comments: Comment[];
  total: number;
};

export abstract class CommentRepository {
  abstract create(data: CreateCommentData): Promise<Comment>;
  abstract update(
    id: string,
    data: Partial<CreateCommentData>,
  ): Promise<Comment>;
  abstract delete(commentId: string): Promise<void>;
  abstract findById(commentId: string): Promise<Comment | null>;
  abstract findByPostId(
    postId: string,
    limit?: number,
    offset?: number,
  ): Promise<CommentResponse>;
  abstract findChildrenByCommentId(
    commentId: string,
    limit?: number,
    offset?: number,
  ): Promise<CommentResponse>;
}
