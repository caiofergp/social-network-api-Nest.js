import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PostsController } from 'src/posts/posts.controller';
import { PostsService } from 'src/posts/posts.service';
import { PostRepository } from 'src/posts/repositories/post.repository';
import { PrismaPostRepository } from 'src/posts/repositories/prisma/prisma-post.repository';
import { CommentRepository } from 'src/posts/repositories/comment.repository';
import { PrismaCommentRepository } from 'src/posts/repositories/prisma/prisma-comment.repository';
import {
  LikeReferenceType,
  LikeRepository,
} from 'src/posts/repositories/like.repository';
import { PrismaLikeRepository } from 'src/posts/repositories/prisma/prisma-like.repository';
import { SharedPostRepository } from 'src/posts/repositories/shared-post.repository';
import { PrismaSharedPostRepository } from 'src/posts/repositories/prisma/prisma-shared-post.repository';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { PrismaMediaRepository } from 'src/medias/repositories/prisma/prisma-media.repository';
import { UnitOfWork } from 'src/db/unit-of-work';
import { PrismaUnitOfWork } from 'src/db/prisma/prisma-unit-of-work';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/repositories/auth.repository';
import { PrismaAuthRepository } from 'src/auth/repositories/prisma/prisma-auth.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { mockUser } from 'src/db/prisma/seeder/main';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        { provide: PostRepository, useClass: PrismaPostRepository },
        { provide: CommentRepository, useClass: PrismaCommentRepository },
        { provide: LikeRepository, useClass: PrismaLikeRepository },
        { provide: SharedPostRepository, useClass: PrismaSharedPostRepository },
        { provide: MediaRepository, useClass: PrismaMediaRepository },
        { provide: AuthRepository, useClass: PrismaAuthRepository },
        {
          provide: StorageAdapter,
          useValue: { moveObject: jest.fn().mockResolvedValue('path') },
        },
        { provide: JwtService, useValue: {} },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn(), emitAsync: jest.fn() },
        },
        PrismaService,
        { provide: UnitOfWork, useClass: PrismaUnitOfWork },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/api/posts (POST)', () => {
    it('should create a post in the database', async () => {
      const content = 'Hello world from E2E';
      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .send({ post: { content } })
        .expect(201);

      expect(response.body.content).toBe(content);

      const post = await prisma.post.findUnique({
        where: { id: response.body.id },
      });
      expect(post).toBeDefined();
    });
  });

  describe('/api/posts/:id/comments (POST)', () => {
    it('should add a comment to a post', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for comment', user_id: mockUser.id },
      });

      const commentContent = 'Nice post!';
      const response = await request(app.getHttpServer())
        .post(`/api/posts/${post.id}/comments`)
        .send({ content: commentContent })
        .expect(201);

      expect(response.body.comment.content).toBe(commentContent);
    });
  });

  describe('/api/posts/:id/like (POST)', () => {
    it('should like a post', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for like', user_id: mockUser.id },
      });

      await request(app.getHttpServer())
        .post(`/api/posts/${post.id}/like`)
        .expect(201);
    });
  });

  describe('/api/posts/comments/:id/like (POST)', () => {
    it('should like a comment', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for comment', user_id: mockUser.id },
      });

      const comment = await prisma.comment.create({
        data: {
          content: 'Comment for like',
          user_id: mockUser.id,
          post_id: post.id,
        },
      });

      await request(app.getHttpServer())
        .post(`/api/posts/comments/${comment.id}/like`)
        .expect(201);
    });
  });

  describe('/api/posts/:id/share (POST)', () => {
    it('should share a post', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for share', user_id: mockUser.id },
      });

      await request(app.getHttpServer())
        .post(`/api/posts/${post.id}/share`)
        .expect(201);
    });
  });

  describe('/api/posts/:id (PATCH)', () => {
    it('should update a post', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for update', user_id: mockUser.id },
      });

      const updatedPost = await request(app.getHttpServer())
        .patch(`/api/posts/${post.id}`)
        .send({ post: { content: 'Updated post' } })
        .expect(200);

      expect(updatedPost.body.content).toBe('Updated post');
    });
  });

  describe('/api/posts/comments/:id (PATCH)', () => {
    it('should update a comment', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for comment', user_id: mockUser.id },
      });

      const comment = await prisma.comment.create({
        data: {
          content: 'Comment for update',
          user_id: mockUser.id,
          post_id: post.id,
        },
      });

      const updatedComment = await request(app.getHttpServer())
        .patch(`/api/posts/comments/${comment.id}`)
        .send({ content: 'Updated comment' })
        .expect(200);

      expect(updatedComment.body.content).toBe('Updated comment');
    });
  });

  describe('/api/posts/:id (DELETE)', () => {
    it('should delete a post', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for delete', user_id: mockUser.id },
      });

      await request(app.getHttpServer())
        .delete(`/api/posts/${post.id}`)
        .expect(200);

      const postDeleted = await prisma.post.findUnique({
        where: { id: post.id },
      });

      expect(postDeleted?.deleted_at).not.toBeNull();
    });
  });

  describe('/api/posts/comments/:id (DELETE)', () => {
    it('should delete a comment', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for delete', user_id: mockUser.id },
      });

      const comment = await prisma.comment.create({
        data: {
          content: 'Comment for delete',
          user_id: mockUser.id,
          post_id: post.id,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/posts/comments/${comment.id}`)
        .expect(200);

      const commentDeleted = await prisma.comment.findUnique({
        where: { id: comment.id },
      });

      expect(commentDeleted?.deleted_at).not.toBeNull();
    });
  });

  describe('/api/posts/like/:id (DELETE)', () => {
    it('should unlike a post', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for unlike', user_id: mockUser.id },
      });

      const like = await prisma.like.create({
        data: {
          user_id: mockUser.id,
          reference_id: post.id,
          type: LikeReferenceType.POST,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/posts/like/${like.id}`)
        .expect(200);

      const likeDeleted = await prisma.like.findUnique({
        where: { id: like.id },
      });

      expect(likeDeleted).toBeNull();
    });
  });

  describe('/api/posts/share/:sharedId (DELETE)', () => {
    it('should unshare a post', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for unshare', user_id: mockUser.id },
      });

      const sharedPost = await prisma.sharedPost.create({
        data: {
          user_id: mockUser.id,
          post_id: post.id,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/posts/share/${sharedPost.id}`)
        .expect(200);

      const sharedPostDeleted = await prisma.sharedPost.findUnique({
        where: { id: sharedPost.id },
      });

      expect(sharedPostDeleted).toBeNull();
    });
  });

  describe('/api/posts/:id/comments (GET)', () => {
    it('should get comments of a post', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for comments', user_id: mockUser.id },
      });

      await prisma.comment.create({
        data: {
          content: 'Comment for post',
          user_id: mockUser.id,
          post_id: post.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/posts/${post.id}/comments`)
        .expect(200);

      expect(response.body.comments.length).toBe(1);
      expect(response.body.comments[0].content).toBe('Comment for post');
    });
  });

  describe('/api/posts/comments/:id/children (GET)', () => {
    it('should get children of a comment', async () => {
      const post = await prisma.post.create({
        data: { content: 'Post for comment', user_id: mockUser.id },
      });

      const comment = await prisma.comment.create({
        data: {
          content: 'Comment for post',
          user_id: mockUser.id,
          post_id: post.id,
        },
      });

      await prisma.comment.create({
        data: {
          content: 'Children comment',
          user_id: mockUser.id,
          post_id: post.id,
          parent_id: comment.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/posts/comments/${comment.id}/children`)
        .expect(200);

      expect(response.body.comments.length).toBe(1);
      expect(response.body.comments[0].content).toBe('Children comment');
    });
  });
});
