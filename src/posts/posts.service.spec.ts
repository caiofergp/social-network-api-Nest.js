import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
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
import {
  BadRequestException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaErrorCode } from 'src/db/prisma/prisma-error-code';
import { Post } from './entities/post.entity';
import { Media } from 'src/medias/entities/media.entity';
import { Like } from './entities/like.entity';
import { User } from 'src/users/entities/user.entity';
import { SharedPost } from './entities/shared-post.entity';
import { Comment } from './entities/comment.entity';

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: jest.Mocked<PostRepository>;
  let mediaRepository: jest.Mocked<MediaRepository>;
  let storageAdapter: jest.Mocked<StorageAdapter>;
  let unitOfWork: jest.Mocked<UnitOfWork>;
  let likeRepository: jest.Mocked<LikeRepository>;
  let commentRepository: jest.Mocked<CommentRepository>;
  let sharedPostRepository: jest.Mocked<SharedPostRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockPostRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockMediaRepository = {
      createMany: jest.fn(),
      findByIdNotIn: jest.fn(),
      deleteMany: jest.fn(),
    };

    const mockStorageAdapter = {
      moveObject: jest.fn(),
      deleteObject: jest.fn(),
    };

    const mockUnitOfWork = {
      runInTransaction: jest.fn().mockImplementation(async (fn) => fn()),
    };

    const mockLikeRepository = {
      create: jest.fn(),
      delete: jest.fn(),
    };

    const mockCommentRepository = {
      findByPostId: jest.fn(),
      findChildrenByCommentId: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockSharedPostRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PostRepository, useValue: mockPostRepository },
        { provide: MediaRepository, useValue: mockMediaRepository },
        { provide: StorageAdapter, useValue: mockStorageAdapter },
        { provide: UnitOfWork, useValue: mockUnitOfWork },
        { provide: LikeRepository, useValue: mockLikeRepository },
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: SharedPostRepository, useValue: mockSharedPostRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepository = module.get(PostRepository);
    mediaRepository = module.get(MediaRepository);
    storageAdapter = module.get(StorageAdapter);
    unitOfWork = module.get(UnitOfWork);
    likeRepository = module.get(LikeRepository);
    commentRepository = module.get(CommentRepository);
    sharedPostRepository = module.get(SharedPostRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post without medias successfully', async () => {
      const createPostDto = {
        post: { content: 'hello text' },
      };
      const userId = 'user-123';
      const expectedPost = {
        id: 'post-123',
        content: 'hello text',
        user_id: userId,
      };

      postRepository.create.mockResolvedValue(expectedPost as Post);

      const result = await service.create(createPostDto, userId);

      expect(postRepository.create).toHaveBeenCalledWith({
        content: 'hello text',
        user_id: userId,
      });
      expect(result).toEqual(expectedPost);
    });

    it('should create a post with valid medias successfully', async () => {
      const createPostDto = {
        post: { content: 'hello text' },
        medias: [{ path: 'tmp/users/user-123/img.png', type: 'image' }],
      };
      const userId = 'user-123';
      const expectedPost = {
        id: 'post-123',
        content: 'hello text',
        user_id: userId,
      };
      const expectedMedia = {
        id: 'media-123',
        path: 'public/users/user-123/img.png',
        entity_id: 'post-123',
      };

      postRepository.create.mockResolvedValue(expectedPost as Post);
      mediaRepository.createMany.mockResolvedValue([expectedMedia] as Media[]);
      storageAdapter.moveObject.mockResolvedValue(undefined);

      const result = await service.create(createPostDto, userId);

      expect(postRepository.create).toHaveBeenCalledWith({
        content: 'hello text',
        user_id: userId,
      });
      expect(mediaRepository.createMany).toHaveBeenCalledWith([
        {
          path: 'public/users/user-123/img.png',
          type: 'image',
          entity_id: 'post-123',
          entity_type: 'POST',
          user_id: userId,
        },
      ]);
      expect(storageAdapter.moveObject).toHaveBeenCalledWith(
        'tmp/users/user-123/img.png',
        'public/users/user-123/img.png',
      );
      expect(result).toEqual({ post: expectedPost, medias: [expectedMedia] });
    });

    it('should throw BadRequestException if media path is invalid', async () => {
      const createPostDto = {
        post: { content: 'hello text' },
        medias: [{ path: 'tmp/users/other-user/img.png', type: 'image' }],
      };
      const userId = 'user-123';

      await expect(service.create(createPostDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should throw NotAcceptableException if post is not found', async () => {
      postRepository.findOne.mockResolvedValue(null);
      await expect(service.update({}, 'post-123', 'user-123')).rejects.toThrow(
        NotAcceptableException,
      );
    });

    it('should throw BadRequestException if user is not the owner of the post', async () => {
      postRepository.findOne.mockResolvedValue({
        id: 'post-123',
        user_id: 'owner-123',
      } as Post);

      await expect(service.update({}, 'post-123', 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update post content successfully', async () => {
      const post = {
        id: 'post-123',
        user_id: 'user-123',
        content: 'old content',
      };
      postRepository.findOne.mockResolvedValue(post as Post);
      postRepository.update.mockResolvedValue({
        ...post,
        content: 'new content',
      } as Post);

      const result = await service.update(
        { post: { id: 'post-123', content: 'new content' } },
        'post-123',
        'user-123',
      );

      expect(postRepository.update).toHaveBeenCalledWith('post-123', {
        id: 'post-123',
        content: 'new content',
      });
      expect(result).toEqual({
        id: 'post-123',
        user_id: 'user-123',
        content: 'new content',
      });
    });

    it('should handle media updates correctly', async () => {
      const post = {
        id: 'post-123',
        user_id: 'user-123',
        content: 'old content',
      };
      postRepository.findOne.mockResolvedValue(post as Post);

      const updatePostDto = {
        medias: [
          {
            id: 'existing-media-1',
            path: 'public/users/user-123/img1.png',
            type: 'image',
          },
          { path: 'tmp/users/user-123/img2.png', type: 'image' },
        ],
      };

      mediaRepository.findByIdNotIn.mockResolvedValue([
        { id: 'deleted-media-1', path: 'public/users/user-123/deleted.png' },
      ] as Media[]);

      mediaRepository.deleteMany.mockResolvedValue(undefined);

      mediaRepository.createMany.mockResolvedValue([
        {
          id: 'new-media-2',
          path: 'public/users/user-123/img2.png',
          entity_id: 'post-123',
        },
      ] as Media[]);

      storageAdapter.moveObject.mockResolvedValue(undefined);
      storageAdapter.deleteObject.mockResolvedValue(undefined);

      const result = await service.update(
        updatePostDto,
        'post-123',
        'user-123',
      );

      expect(mediaRepository.findByIdNotIn).toHaveBeenCalledWith(
        ['existing-media-1'],
        'post-123',
      );

      expect(mediaRepository.deleteMany).toHaveBeenCalledWith([
        'deleted-media-1',
      ]);

      expect(mediaRepository.createMany).toHaveBeenCalledWith([
        {
          path: 'public/users/user-123/img2.png',
          type: 'image',
          entity_id: 'post-123',
          entity_type: 'POST',
          user_id: 'user-123',
        },
      ]);

      expect(storageAdapter.moveObject).toHaveBeenCalledWith(
        'tmp/users/user-123/img2.png',
        'public/users/user-123/img2.png',
      );

      expect(storageAdapter.deleteObject).toHaveBeenCalledWith(
        'public/users/user-123/deleted.png',
      );

      expect(result).toEqual({
        post,
        medias: [
          {
            id: 'new-media-2',
            path: 'public/users/user-123/img2.png',
            entity_id: 'post-123',
          },
          {
            id: 'existing-media-1',
            path: 'public/users/user-123/img1.png',
            type: 'image',
          },
        ],
      });
    });
  });

  describe('delete', () => {
    it('should delete post and its medias successfully', async () => {
      const post = {
        id: 'post-123',
        user_id: 'user-123',
        medias: [{ id: 'media-1', path: 'public/users/user-123/img1.png' }],
      };

      postRepository.findOne.mockResolvedValue(post as Post);
      postRepository.delete.mockResolvedValue(undefined);
      storageAdapter.deleteObject.mockResolvedValue(undefined);

      const result = await service.delete('post-123', 'user-123');

      expect(postRepository.delete).toHaveBeenCalledWith('post-123');
      expect(storageAdapter.deleteObject).toHaveBeenCalledWith(
        'public/users/user-123/img1.png',
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw NotAcceptableException if post to delete is not found', async () => {
      postRepository.findOne.mockResolvedValue(null);
      await expect(service.delete('post-123', 'user-123')).rejects.toThrow(
        NotAcceptableException,
      );
    });

    it('should throw BadRequestException if user is not the owner of the deleted post', async () => {
      postRepository.findOne.mockResolvedValue({
        id: 'post-123',
        user_id: 'owner-123',
      } as Post);

      await expect(service.delete('post-123', 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addLike', () => {
    it('should add like successfully and emit event', async () => {
      const post = { id: 'post-123', user_id: 'owner-123' };
      const user = { id: 'user-123', name: 'John Doe' };

      postRepository.findOne.mockResolvedValue(post as Post);
      likeRepository.create.mockResolvedValue({ id: 'like-123' } as Like);

      const result = await service.addLike(
        'post-123',
        user as User,
        LikeReferenceType.POST,
      );

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

    it('should throw NotAcceptableException if liked post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addLike(
          'post-123',
          { id: 'user-123' } as User,
          LikeReferenceType.POST,
        ),
      ).rejects.toThrow(NotAcceptableException);
    });

    it('should throw BadRequestException if like is already present (unique constraint)', async () => {
      const post = { id: 'post-123', user_id: 'owner-123' };
      postRepository.findOne.mockResolvedValue(post as Post);

      const err = { code: PrismaErrorCode.uniqueConstraint };
      likeRepository.create.mockRejectedValue(err);

      await expect(
        service.addLike(
          'post-123',
          { id: 'user-123' } as User,
          LikeReferenceType.POST,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteLike', () => {
    it('should delete like successfully', async () => {
      likeRepository.delete.mockResolvedValue({ id: 'like-123' } as Like);

      const result = await service.deleteLike('like-123');

      expect(likeRepository.delete).toHaveBeenCalledWith('like-123');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getPostComments', () => {
    it('should return comments with pagination defaults', async () => {
      const comments: CommentResponse = {
        total: 1,
        comments: [
          {
            id: 'comment-1',
            content: 'comment',
            post_id: 'post-123',
            user_id: 'user-123',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            _count: { likes: 0 },
          },
        ],
      };
      commentRepository.findByPostId.mockResolvedValue(comments);

      const result = await service.getPostComments('post-123', {});

      expect(commentRepository.findByPostId).toHaveBeenCalledWith(
        'post-123',
        20,
        0,
      );
      expect(result).toEqual({ comments });
    });

    it('should return comments with custom pagination', async () => {
      const comments: CommentResponse = {
        total: 1,
        comments: [
          {
            id: 'comment-1',
            content: 'comment',
            post_id: 'post-123',
            user_id: 'user-123',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            _count: { likes: 0 },
          },
        ],
      };
      commentRepository.findByPostId.mockResolvedValue(comments);

      const result = await service.getPostComments('post-123', {
        page: 3,
        limit: 10,
      });

      expect(commentRepository.findByPostId).toHaveBeenCalledWith(
        'post-123',
        10,
        20,
      );
      expect(result).toEqual({ comments });
    });
  });

  describe('getPostCommentsChildren', () => {
    it('should return child comments with pagination', async () => {
      const comments: CommentResponse = {
        total: 1,
        comments: [
          {
            id: 'comment-child-1',
            content: 'child comment',
            post_id: 'post-123',
            user_id: 'user-123',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            _count: { likes: 0 },
          },
        ],
      };
      commentRepository.findChildrenByCommentId.mockResolvedValue(comments);

      const result = await service.getPostCommentsChildren('comment-parent', {
        page: 2,
        limit: 5,
      });

      expect(commentRepository.findChildrenByCommentId).toHaveBeenCalledWith(
        'comment-parent',
        5,
        5,
      );
      expect(result).toEqual({ comments });
    });
  });

  describe('addComment', () => {
    it('should add comment successfully and emit event', async () => {
      const post = { id: 'post-123', user_id: 'owner-123' };
      const user = { id: 'user-123', name: 'Commenter' };
      const data = { content: 'nice post' };
      const comment: Comment = {
        id: 'comment-123',
        content: 'nice post',
        post_id: 'post-123',
        user_id: user.id,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      postRepository.findOne.mockResolvedValue(post as Post);
      commentRepository.create.mockResolvedValue(comment);

      const result = await service.addComment('post-123', data, user as User);

      expect(commentRepository.create).toHaveBeenCalledWith({
        content: 'nice post',
        post_id: 'post-123',
        user_id: 'user-123',
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'comment.created',
        expect.any(Object),
      );
      expect(result).toEqual({ comment });
    });

    it('should throw NotFoundException if commenting on non-existent post', async () => {
      postRepository.findOne.mockResolvedValue(null);
      await expect(
        service.addComment('post-123', { content: 'test' }, {
          id: 'user-123',
        } as User),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateComment', () => {
    it('should update comment successfully', async () => {
      const comment: Comment = {
        id: 'comment-123',
        user_id: 'user-123',
        content: 'old content',
        post_id: 'post-123',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      commentRepository.findById.mockResolvedValue(comment);
      commentRepository.update.mockResolvedValue({
        ...comment,
        content: 'new content',
      });

      const result = await service.updateComment(
        'comment-123',
        { content: 'new content' },
        'user-123',
      );

      expect(commentRepository.update).toHaveBeenCalledWith('comment-123', {
        content: 'new content',
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if comment not found', async () => {
      commentRepository.findById.mockResolvedValue(null);
      await expect(
        service.updateComment('comment-123', { content: 'new' }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if updater is not comment owner', async () => {
      const comment: Comment = {
        id: 'comment-123',
        user_id: 'owner-123',
        content: 'old content',
        post_id: 'post-123',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      commentRepository.findById.mockResolvedValue(comment);
      await expect(
        service.updateComment('comment-123', { content: 'new' }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment successfully', async () => {
      const comment: Comment = {
        id: 'comment-123',
        user_id: 'user-123',
        content: 'old content',
        post_id: 'post-123',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      commentRepository.findById.mockResolvedValue(comment);
      commentRepository.delete.mockResolvedValue();

      const result = await service.deleteComment('comment-123', 'user-123');

      expect(commentRepository.delete).toHaveBeenCalledWith('comment-123');
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if comment to delete is not found', async () => {
      commentRepository.findById.mockResolvedValue(null);
      await expect(
        service.deleteComment('comment-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if deleter is not comment owner', async () => {
      const comment: Comment = {
        id: 'comment-123',
        user_id: 'owner-123',
        content: 'old content',
        post_id: 'post-123',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      commentRepository.findById.mockResolvedValue(comment);
      await expect(
        service.deleteComment('comment-123', 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('sharePost', () => {
    it('should share post successfully and emit event', async () => {
      const post = { id: 'post-123', user_id: 'owner-123' };
      const user = { id: 'user-123', name: 'Sharer' };
      const sharedPost = {
        id: 'shared-123',
        user_id: user.id,
        post_id: 'post-123',
      };

      postRepository.findOne.mockResolvedValue(post as Post);
      sharedPostRepository.create.mockResolvedValue(sharedPost as SharedPost);

      const result = await service.sharePost('post-123', user as User);

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

    it('should throw NotFoundException if shared post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);
      await expect(
        service.sharePost('post-123', { id: 'user-123' } as User),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unsharePost', () => {
    it('should unshare post successfully', async () => {
      const sharedPost = { id: 'shared-123', user_id: 'user-123' };

      sharedPostRepository.findById.mockResolvedValue(sharedPost as SharedPost);
      sharedPostRepository.delete.mockResolvedValue();

      const result = await service.unsharePost('shared-123', 'user-123');

      expect(sharedPostRepository.delete).toHaveBeenCalledWith('shared-123');
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if shared post to delete not found', async () => {
      sharedPostRepository.findById.mockResolvedValue(null);

      await expect(
        service.unsharePost('shared-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if unsharer is not shared post owner', async () => {
      sharedPostRepository.findById.mockResolvedValue({
        id: 'shared-123',
        user_id: 'owner-123',
      } as SharedPost);

      await expect(
        service.unsharePost('shared-123', 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
