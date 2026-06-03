import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/repositories/user.repository';
import { PrismaUserRepository } from 'src/users/repositories/prisma/prisma-user.repository';
import { MediaRepository } from 'src/medias/repositories/media.repository';
import { PrismaMediaRepository } from 'src/medias/repositories/prisma/prisma-media.repository';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { AuthGuard } from 'src/guards/auth.guard';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { UnitOfWork } from 'src/db/unit-of-work';
import { PrismaUnitOfWork } from 'src/db/prisma/prisma-unit-of-work';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/repositories/auth.repository';
import { PrismaAuthRepository } from 'src/auth/repositories/prisma/prisma-auth.repository';
import { mockUser } from 'src/db/prisma/seeder/main';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: UserRepository, useClass: PrismaUserRepository },
        { provide: MediaRepository, useClass: PrismaMediaRepository },
        { provide: AuthRepository, useClass: PrismaAuthRepository },
        {
          provide: StorageAdapter,
          useValue: {
            getDownloadUrl: jest.fn().mockResolvedValue('http://download.com'),
          },
        },
        PrismaService,
        { provide: UnitOfWork, useClass: PrismaUnitOfWork },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({ id: 'user-e2e-1' }),
          },
        },
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

  describe('/api/users/profile (GET)', () => {
    it('should return the authenticated user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .expect(200);

      expect(response.body.id).toEqual(mockUser.id);
    });
  });

  describe('/api/users/profile (PATCH)', () => {
    it('should update the authenticated user profile', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toEqual('Updated Name');

      const updatedUser = await prisma.user.findUnique({
        where: { id: mockUser.id },
      });
      expect(updatedUser?.name).toEqual('Updated Name');
    });
  });
});
