import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthRepository } from 'src/auth/repositories/auth.repository';
import { PrismaAuthRepository } from 'src/auth/repositories/prisma/prisma-auth.repository';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UnitOfWork } from 'src/db/unit-of-work';
import { PrismaUnitOfWork } from 'src/db/prisma/prisma-unit-of-work';
import { PasswordResetTokenRepository } from 'src/auth/repositories/password-reset-token.repository';
import { PrismaPasswordResetTokenRepository } from 'src/auth/repositories/prisma/prisma-password-reset-token.repository';
import { AuthGuard } from 'src/guards/auth.guard';
import { HashAdapter } from 'src/adapters/hash/hash.adapter';
import { BcryptAdapter } from 'src/adapters/hash/bcrypt.adapter';
import { DateManagerAdapter } from 'src/adapters/date-manager/date-manager.adapter';
import { DateFnsAdapter } from 'src/adapters/date-manager/date-fns.adapter';
import { PrismaService } from 'src/db/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: AuthRepository, useClass: PrismaAuthRepository },
        {
          provide: PasswordResetTokenRepository,
          useClass: PrismaPasswordResetTokenRepository,
        },
        {
          provide: MailService,
          useValue: {
            sendConfirmAccountEmail: jest.fn().mockResolvedValue(null),
            sendResetPasswordEmail: jest.fn().mockResolvedValue(null),
          },
        },
        PrismaService,
        { provide: UnitOfWork, useClass: PrismaUnitOfWork },
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
        { provide: HashAdapter, useClass: BcryptAdapter },
        { provide: DateManagerAdapter, useClass: DateFnsAdapter },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: () => true,
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

  describe('/api/sign-up (POST)', () => {
    it('should create a new user in the database', async () => {
      const email = 'new-e2e@example.com';
      await request(app.getHttpServer())
        .post('/api/sign-up')
        .send({
          email,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          name: 'New E2E User',
        })
        .expect(201);

      const user = await prisma.user.findUnique({ where: { email } });
      expect(user).toBeDefined();
    });
  });

  describe('/api/sign-in (POST)', () => {
    it('should return token for valid credentials', async () => {
      const email = 'login-e2e@example.com';
      const password = 'Password123!';
      const hashedPassword = await app
        .get<HashAdapter>(HashAdapter)
        .hash(password);

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Login E2E',
          email_verified_at: new Date(),
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/sign-in')
        .send({ email, password })
        .expect(200);

      expect(response.body.token).toBeDefined();
    });
  });
});
