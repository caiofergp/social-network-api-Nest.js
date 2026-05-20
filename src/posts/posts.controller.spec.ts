import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { PostRepository } from './repositories/post.repository';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { UnitOfWork } from 'src/db/unit-of-work';
import {
  LikeReferenceType,
  LikeRepository,
} from './repositories/like.repository';
import {
  CommentRepository,
  CommentResponse,
} from './repositories/comment.repository';
import { SharedPostRepository } from './repositories/shared-post.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { Comment } from './entities/comment.entity';
import { SharedPost } from './entities/shared-post.entity';
import { User } from 'src/users/entities/user.entity';

describe('PostsController', () => {
  let controller: PostsController;
  let postRepository: jest.Mocked<PostRepository>;
  let mediaRepository: jest.Mocked<MediaRepository>;
  let storageAdapter: jest.Mocked<StorageAdapter>;
  let likeRepository: jest.Mocked<LikeRepository>;
  let commentRepository: jest.Mocked<CommentRepository>;
  let sharedPostRepository: jest.Mocked<SharedPostRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const now = new Date();

  const mockUser: User = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed',
    token: null,
    expires_at: null,
  };

  const mockRequest = { user: mockUser } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        {
          provide: PostRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: MediaRepository,
          useValue: {
            createMany: jest.fn(),
            findByIdNotIn: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: StorageAdapter,
          useValue: {
            moveObject: jest.fn(),
            deleteObject: jest.fn(),
          },
        },
        {
          provide: UnitOfWork,
          useValue: {
            runInTransaction: jest.fn().mockImplementation(async (fn) => fn()),
          },
        },
        {
          provide: LikeRepository,
          useValue: {
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CommentRepository,
          useValue: {
            findByPostId: jest.fn(),
            findChildrenByCommentId: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: SharedPostRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(PostsController);
    postRepository = module.get(PostRepository);
    mediaRepository = module.get(MediaRepository);
    storageAdapter = module.get(StorageAdapter);
    likeRepository = module.get(LikeRepository);
    commentRepository = module.get(CommentRepository);
    sharedPostRepository = module.get(SharedPostRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post without medias', async () => {
      const dto = { post: { content: 'hello' } };
      const createdPost: Post = {
        id: 'post-123',
        content: 'hello',
        user_id: 'user-123',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };

      postRepository.create.mockResolvedValue(createdPost);

      const result = await controller.create(dto, mockRequest);

      expect(postRepository.create).toHaveBeenCalledWith({
        content: 'hello',
        user_id: 'user-123',
      });
      expect(result).toEqual(createdPost);
    });

    it('should create a post with medias', async () => {
      const dto = {
        post: { content: 'hello' },
        medias: [{ path: 'tmp/users/user-123/img.png', type: 'image' }],
      };
      const createdPost: Post = {
        id: 'post-123',
        content: 'hello',
        user_id: 'user-123',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };

      postRepository.create.mockResolvedValue(createdPost);
      mediaRepository.createMany.mockResolvedValue([]);
      storageAdapter.moveObject.mockResolvedValue(undefined);

      const result = await controller.create(dto, mockRequest);

      expect(postRepository.create).toHaveBeenCalled();
      expect(mediaRepository.createMany).toHaveBeenCalled();
      expect(storageAdapter.moveObject).toHaveBeenCalledWith(
        'tmp/users/user-123/img.png',
        'public/users/user-123/img.png',
      );
      expect(result).toHaveProperty('post');
    });
  });

  describe('update', () => {
    it('should update post content', async () => {
      const existingPost: Post = {
        id: 'post-123',
        content: 'old',
        user_id: 'user-123',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      const updatedPost: Post = { ...existingPost, content: 'new content' };

      postRepository.findOne.mockResolvedValue(existingPost);
      postRepository.update.mockResolvedValue(updatedPost);

      const result = await controller.update(
        'post-123',
        { post: { id: 'post-123', content: 'new content' } },
        mockRequest,
      );

      expect(postRepository.update).toHaveBeenCalledWith('post-123', {
        id: 'post-123',
        content: 'new content',
      });
      expect(result).toEqual(updatedPost);
    });
  });

  describe('delete', () => {
    it('should delete post and its medias', async () => {
      const existingPost: Post = {
        id: 'post-123',
        content: 'content',
        user_id: 'user-123',
        medias: [],
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };

      postRepository.findOne.mockResolvedValue(existingPost);
      postRepository.delete.mockResolvedValue(undefined);

      const result = await controller.delete('post-123', mockRequest);

      expect(postRepository.delete).toHaveBeenCalledWith('post-123');
      expect(result).toEqual({ success: true });
    });
  });

  describe('like', () => {
    it('should add a like to a post', async () => {
      const existingPost: Post = {
        id: 'post-123',
        content: 'content',
        user_id: 'owner-456',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      const like: Like = {
        id: 'like-123',
        user_id: 'user-123',
        reference_id: 'post-123',
        type: 'post',
        created_at: now,
      };

      postRepository.findOne.mockResolvedValue(existingPost);
      likeRepository.create.mockResolvedValue(like);

      const result = await controller.like('post-123', mockRequest);

      expect(likeRepository.create).toHaveBeenCalledWith(
        'post-123',
        'user-123',
        LikeReferenceType.POST,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'post.liked',
        expect.any(Object),
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('commentLike', () => {
    it('should add a like to a comment', async () => {
      const existingPost: Post = {
        id: 'comment-123',
        content: 'content',
        user_id: 'owner-456',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      const like: Like = {
        id: 'like-123',
        user_id: 'user-123',
        reference_id: 'comment-123',
        type: 'comment',
        created_at: now,
      };

      postRepository.findOne.mockResolvedValue(existingPost);
      likeRepository.create.mockResolvedValue(like);

      const result = await controller.commentLike('comment-123', mockRequest);

      expect(likeRepository.create).toHaveBeenCalledWith(
        'comment-123',
        'user-123',
        LikeReferenceType.COMMENT,
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('unlike', () => {
    it('should remove a like', async () => {
      const like: Like = {
        id: 'like-123',
        user_id: 'user-123',
        reference_id: 'post-123',
        type: 'post',
        created_at: now,
      };

      likeRepository.delete.mockResolvedValue(like);

      const result = await controller.unlike('like-123');

      expect(likeRepository.delete).toHaveBeenCalledWith('like-123');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getComments', () => {
    it('should return paginated comments for a post', async () => {
      const commentsResponse: CommentResponse = {
        total: 1,
        comments: [
          {
            id: 'comment-1',
            content: 'comment',
            post_id: 'post-123',
            user_id: 'user-123',
            created_at: now,
            updated_at: now,
            deleted_at: null,
            _count: { likes: 0 },
          },
        ],
      };

      commentRepository.findByPostId.mockResolvedValue(commentsResponse);

      const result = await controller.getComments('post-123', {
        page: 1,
        limit: 10,
      });

      expect(commentRepository.findByPostId).toHaveBeenCalledWith(
        'post-123',
        10,
        0,
      );
      expect(result).toEqual({ comments: commentsResponse });
    });
  });

  describe('getCommentsChildren', () => {
    it('should return paginated child comments', async () => {
      const commentsResponse: CommentResponse = {
        total: 0,
        comments: [],
      };

      commentRepository.findChildrenByCommentId.mockResolvedValue(
        commentsResponse,
      );

      const result = await controller.getCommentsChildren('comment-123', {
        page: 1,
        limit: 10,
      });

      expect(commentRepository.findChildrenByCommentId).toHaveBeenCalledWith(
        'comment-123',
        10,
        0,
      );
      expect(result).toEqual({ comments: commentsResponse });
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post', async () => {
      const existingPost: Post = {
        id: 'post-123',
        content: 'content',
        user_id: 'owner-456',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      const createdComment: Comment = {
        id: 'comment-123',
        content: 'nice post',
        post_id: 'post-123',
        user_id: 'user-123',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };

      postRepository.findOne.mockResolvedValue(existingPost);
      commentRepository.create.mockResolvedValue(createdComment);

      const result = await controller.addComment(
        'post-123',
        { content: 'nice post' },
        mockRequest,
      );

      expect(commentRepository.create).toHaveBeenCalledWith({
        content: 'nice post',
        post_id: 'post-123',
        user_id: 'user-123',
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'comment.created',
        expect.any(Object),
      );
      expect(result).toEqual({ comment: createdComment });
    });
  });

  describe('updateComment', () => {
    it('should update comment content', async () => {
      const existingComment: Comment = {
        id: 'comment-123',
        content: 'old',
        post_id: 'post-123',
        user_id: 'user-123',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      const updatedComment: Comment = {
        ...existingComment,
        content: 'updated comment',
      };

      commentRepository.findById.mockResolvedValue(existingComment);
      commentRepository.update.mockResolvedValue(updatedComment);

      const result = await controller.updateComment(
        'comment-123',
        { content: 'updated comment' },
        mockRequest,
      );

      expect(commentRepository.update).toHaveBeenCalledWith('comment-123', {
        content: 'updated comment',
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const existingComment: Comment = {
        id: 'comment-123',
        content: 'content',
        post_id: 'post-123',
        user_id: 'user-123',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };

      commentRepository.findById.mockResolvedValue(existingComment);
      commentRepository.delete.mockResolvedValue();

      const result = await controller.deleteComment('comment-123', mockRequest);

      expect(commentRepository.delete).toHaveBeenCalledWith('comment-123');
      expect(result).toEqual({ success: true });
    });
  });

  describe('sharePost', () => {
    it('should share a post', async () => {
      const existingPost: Post = {
        id: 'post-123',
        content: 'content',
        user_id: 'owner-456',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      const sharedPost: SharedPost = {
        id: 'shared-123',
        post_id: 'post-123',
        user_id: 'user-123',
        created_at: now,
      };

      postRepository.findOne.mockResolvedValue(existingPost);
      sharedPostRepository.create.mockResolvedValue(sharedPost);

      const result = await controller.sharePost('post-123', mockRequest);

      expect(sharedPostRepository.create).toHaveBeenCalledWith(
        'user-123',
        'post-123',
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'post.shared',
        expect.any(Object),
      );
      expect(result).toEqual({ sharedPost });
    });
  });

  describe('unsharePost', () => {
    it('should unshare a post', async () => {
      const sharedPost: SharedPost = {
        id: 'shared-123',
        post_id: 'post-123',
        user_id: 'user-123',
        created_at: now,
      };

      sharedPostRepository.findById.mockResolvedValue(sharedPost);
      sharedPostRepository.delete.mockResolvedValue();

      const result = await controller.unsharePost('shared-123', mockRequest);

      expect(sharedPostRepository.delete).toHaveBeenCalledWith('shared-123');
      expect(result).toEqual({ success: true });
    });
  });
});
