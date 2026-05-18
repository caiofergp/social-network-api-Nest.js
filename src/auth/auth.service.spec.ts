import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { HashAdapter } from '../adapters/hash/hash.adapter';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { DateManagerAdapter } from 'src/adapters/date-manager/date-manager.adapter';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: AuthRepository;
  let passwordResetTokenRepository: PasswordResetTokenRepository;
  let hashAdapter: HashAdapter;
  let jwtService: JwtService;
  let mailService: MailService;
  let dateManager: DateManagerAdapter;

  const mockAuthRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockPasswordResetTokenRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockHashAdapter = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockMailService = {
    sendConfirmAccountEmail: jest.fn(),
    sendResetPasswordEmail: jest.fn(),
  };

  const mockDateManager = {
    now: jest.fn(),
    addDays: jest.fn(),
    addHours: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        {
          provide: PasswordResetTokenRepository,
          useValue: mockPasswordResetTokenRepository,
        },
        { provide: HashAdapter, useValue: mockHashAdapter },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
        { provide: DateManagerAdapter, useValue: mockDateManager },
      ],
    }).compile();

    service = module.get(AuthService);
    authRepository = module.get(AuthRepository);
    passwordResetTokenRepository = module.get(PasswordResetTokenRepository);
    hashAdapter = module.get(HashAdapter);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
    dateManager = module.get(DateManagerAdapter);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signin', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockAuthRepository.findOne.mockResolvedValue(null);

      await expect(
        service.signin({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user email is not verified', async () => {
      mockAuthRepository.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        email_verified_at: null,
      });

      await expect(
        service.signin({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if password compare returns false', async () => {
      mockAuthRepository.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedpassword',
        email_verified_at: new Date(),
      });
      mockHashAdapter.compare.mockResolvedValue(false);

      await expect(
        service.signin({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return a token if successful', async () => {
      mockAuthRepository.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedpassword',
        email_verified_at: new Date(),
      });
      mockHashAdapter.compare.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.signin({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result).toBe('mock-token');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ id: 'user-id' });
    });
  });

  describe('signup', () => {
    it('should throw BadRequestException if user already exists', async () => {
      mockAuthRepository.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.signup({
          name: 'John',
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'password',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully hash password, save user, and send confirmation email', async () => {
      mockAuthRepository.findOne.mockResolvedValue(null);
      mockHashAdapter.hash.mockResolvedValue('hashed-password');

      const mockDate = new Date();
      mockDateManager.now.mockReturnValue(mockDate);
      mockDateManager.addDays.mockReturnValue(mockDate);

      const createdUser = {
        id: 'new-id',
        name: 'John',
        email: 'test@example.com',
      };
      mockAuthRepository.create.mockResolvedValue(createdUser);

      await service.signup({
        name: 'John',
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
      });

      expect(mockHashAdapter.hash).toHaveBeenCalledWith('password');
      expect(mockAuthRepository.create).toHaveBeenCalled();
      expect(mockMailService.sendConfirmAccountEmail).toHaveBeenCalledWith(
        createdUser,
        expect.any(String),
      );
    });
  });

  describe('confirmAccount', () => {
    it('should return fail page if token does not exist', async () => {
      mockAuthRepository.findOne.mockResolvedValue(null);

      const result = await service.confirmAccount('some-token');
      expect(result).toContain('Verification Failed');
    });

    it('should return fail page if token is expired', async () => {
      const expiredDate = new Date(Date.now() - 1000);
      mockAuthRepository.findOne.mockResolvedValue({
        id: 'id',
        expires_at: expiredDate,
      });
      mockDateManager.now.mockReturnValue(new Date());

      const result = await service.confirmAccount('some-token');
      expect(result).toContain('Verification Failed');
    });

    it('should verify email and return success page if token is valid', async () => {
      const futureDate = new Date(Date.now() + 100000);
      const user = {
        id: 'user-id',
        expires_at: futureDate,
      };
      mockAuthRepository.findOne.mockResolvedValue(user);

      const now = new Date();
      mockDateManager.now.mockReturnValue(now);

      const result = await service.confirmAccount('some-token');

      expect(mockAuthRepository.update).toHaveBeenCalledWith('user-id', {
        email_verified_at: now,
        token: null,
        expires_at: null,
      });
      expect(result).toContain('Account Confirmed!');
    });
  });

  describe('resetPasswordRequest', () => {
    it('should throw NotFoundException if user email is not found', async () => {
      mockAuthRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resetPasswordRequest('notfound@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create token and send email if user found', async () => {
      const user = { id: 'user-id', name: 'John', email: 'john@example.com' };
      mockAuthRepository.findOne.mockResolvedValue(user);

      const now = new Date();
      mockDateManager.now.mockReturnValue(now);
      mockDateManager.addHours.mockReturnValue(now);

      await service.resetPasswordRequest('john@example.com');

      expect(mockPasswordResetTokenRepository.create).toHaveBeenCalled();
      expect(mockMailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        user,
        expect.any(String),
        now,
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if token is invalid/not found', async () => {
      mockPasswordResetTokenRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid-token', 'newPassword'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is expired', async () => {
      const expiredDate = new Date(Date.now() - 1000);
      mockPasswordResetTokenRepository.findOne.mockResolvedValue({
        expires_at: expiredDate,
      });
      mockDateManager.now.mockReturnValue(new Date());

      await expect(
        service.resetPassword('token', 'newPassword'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token already used', async () => {
      const futureDate = new Date(Date.now() + 100000);
      mockPasswordResetTokenRepository.findOne.mockResolvedValue({
        expires_at: futureDate,
        used_at: new Date(),
      });
      mockDateManager.now.mockReturnValue(new Date());

      await expect(
        service.resetPassword('token', 'newPassword'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully hash new password, update user password, and update token as used', async () => {
      const futureDate = new Date(Date.now() + 100000);
      const resetToken = {
        id: 'token-id',
        user_id: 'user-id',
        expires_at: futureDate,
        used_at: null,
      };
      mockPasswordResetTokenRepository.findOne.mockResolvedValue(resetToken);

      const now = new Date();
      mockDateManager.now.mockReturnValue(now);
      mockHashAdapter.hash.mockResolvedValue('hashed-new-password');

      await service.resetPassword('token', 'newPassword');

      expect(mockHashAdapter.hash).toHaveBeenCalledWith('newPassword');
      expect(mockAuthRepository.update).toHaveBeenCalledWith('user-id', {
        password: 'hashed-new-password',
      });
      expect(mockPasswordResetTokenRepository.update).toHaveBeenCalledWith(
        'token-id',
        {
          used_at: now,
        },
      );
    });
  });

  describe('resetPasswordPage', () => {
    it('should throw BadRequestException if token is invalid/not found', async () => {
      mockPasswordResetTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPasswordPage('invalid-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return error page template if token is expired', async () => {
      const expiredDate = new Date(Date.now() - 1000);
      mockPasswordResetTokenRepository.findOne.mockResolvedValue({
        expires_at: expiredDate,
      });
      mockDateManager.now.mockReturnValue(new Date());

      const result = await service.resetPasswordPage('token');
      expect(result).toContain('Invalid or Expired Token');
    });

    it('should return error page template if token is already used', async () => {
      const futureDate = new Date(Date.now() + 100000);
      mockPasswordResetTokenRepository.findOne.mockResolvedValue({
        expires_at: futureDate,
        used_at: new Date(),
      });
      mockDateManager.now.mockReturnValue(new Date());

      const result = await service.resetPasswordPage('token');
      expect(result).toContain('Invalid or Expired Token');
    });

    it('should return active form template if token is valid', async () => {
      const futureDate = new Date(Date.now() + 100000);
      mockPasswordResetTokenRepository.findOne.mockResolvedValue({
        expires_at: futureDate,
        used_at: null,
      });
      mockDateManager.now.mockReturnValue(new Date());

      const result = await service.resetPasswordPage('token');
      expect(result).toContain('<form');
    });
  });
});
