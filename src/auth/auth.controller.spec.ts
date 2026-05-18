import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { HashAdapter } from '../adapters/hash/hash.adapter';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { DateManagerAdapter } from 'src/adapters/date-manager/date-manager.adapter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
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
      controllers: [AuthController],
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

    controller = module.get(AuthController);
    authRepository = module.get(AuthRepository);
    passwordResetTokenRepository = module.get(PasswordResetTokenRepository);
    hashAdapter = module.get(HashAdapter);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
    dateManager = module.get<DateManagerAdapter>(DateManagerAdapter);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should successfully sign up a user and return success message', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      mockAuthRepository.findOne.mockResolvedValue(null);
      mockHashAdapter.hash.mockResolvedValue('hashed-password');

      const mockDate = new Date();
      mockDateManager.now.mockReturnValue(mockDate);
      mockDateManager.addDays.mockReturnValue(mockDate);

      const createdUser = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
      };
      mockAuthRepository.create.mockResolvedValue(createdUser);

      const result = await controller.signup(dto);

      expect(authRepository.findOne).toHaveBeenCalledWith({
        email: 'john@example.com',
      });
      expect(hashAdapter.hash).toHaveBeenCalledWith('password123');
      expect(authRepository.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        token: expect.any(String),
        expires_at: mockDate,
      });
      expect(mailService.sendConfirmAccountEmail).toHaveBeenCalledWith(
        createdUser,
        expect.any(String),
      );
      expect(result).toEqual({ message: 'User created successfully' });
    });

    it('should throw BadRequestException if user already exists', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };
      mockAuthRepository.findOne.mockResolvedValue({ id: 'existing-id' });

      await expect(controller.signup(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('signin', () => {
    it('should sign in user, set cookie, and return jwt token', async () => {
      const dto = { email: 'john@example.com', password: 'password123' };
      const user = {
        id: 'user-id',
        email: 'john@example.com',
        password: 'hashed-password',
        email_verified_at: new Date(),
      };

      mockAuthRepository.findOne.mockResolvedValue(user);
      mockHashAdapter.compare.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.signin(dto, res);

      expect(authRepository.findOne).toHaveBeenCalledWith({
        email: 'john@example.com',
      });
      expect(hashAdapter.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({ id: 'user-id' });
      expect(res.cookie).toHaveBeenCalledWith('token', 'mock-jwt-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      expect(result).toEqual({ token: 'mock-jwt-token' });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const dto = { email: 'nonexistent@example.com', password: 'password' };
      mockAuthRepository.findOne.mockResolvedValue(null);

      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(controller.signin(dto, res)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('confirmAccount', () => {
    it('should confirm user account and return success HTML', async () => {
      const token = 'valid-token';
      const user = {
        id: 'user-id',
        expires_at: new Date(Date.now() + 10000),
      };

      mockAuthRepository.findOne.mockResolvedValue(user);
      const mockDate = new Date();
      mockDateManager.now.mockReturnValue(mockDate);

      const result = await controller.confirmAccount(token);

      expect(authRepository.update).toHaveBeenCalledWith('user-id', {
        email_verified_at: mockDate,
        token: null,
        expires_at: null,
      });
      expect(result).toContain('Account Confirmed!');
    });
  });

  describe('resetPasswordRequest', () => {
    it('should create a token and send a reset email', async () => {
      const email = 'john@example.com';
      const user = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockAuthRepository.findOne.mockResolvedValue(user);
      const mockDate = new Date();
      mockDateManager.now.mockReturnValue(mockDate);
      mockDateManager.addHours.mockReturnValue(mockDate);

      const result = await controller.resetPasswordRequest({ email });

      expect(passwordResetTokenRepository.create).toHaveBeenCalledWith({
        token: expect.any(String),
        expires_at: mockDate,
        user_id: 'user-id',
        used_at: null,
      });
      expect(mailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        user,
        expect.any(String),
        mockDate,
      );
      expect(result).toEqual({
        message: 'Reset password request sent successfully',
      });
    });
  });

  describe('validateResetPasswordToken', () => {
    it('should return HTML for the reset password form page', async () => {
      const token = 'reset-token';
      const resetToken = {
        id: 'token-id',
        expires_at: new Date(Date.now() + 10000),
        used_at: null,
      };

      mockPasswordResetTokenRepository.findOne.mockResolvedValue(resetToken);
      mockDateManager.now.mockReturnValue(new Date());

      const res = {
        type: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.validateResetPasswordToken(token, res);

      expect(res.type).toHaveBeenCalledWith('html');
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<form'));
    });
  });

  describe('resetPassword', () => {
    it('should successfully update user password and mark reset token as used', async () => {
      const token = 'reset-token';
      const resetToken = {
        id: 'token-id',
        user_id: 'user-id',
        expires_at: new Date(Date.now() + 10000),
        used_at: null,
      };

      mockPasswordResetTokenRepository.findOne.mockResolvedValue(resetToken);
      const mockDate = new Date();
      mockDateManager.now.mockReturnValue(mockDate);
      mockHashAdapter.hash.mockResolvedValue('hashed-new-password');

      const result = await controller.resetPassword(token, {
        password: 'new-password',
      });

      expect(hashAdapter.hash).toHaveBeenCalledWith('new-password');
      expect(authRepository.update).toHaveBeenCalledWith('user-id', {
        password: 'hashed-new-password',
      });
      expect(passwordResetTokenRepository.update).toHaveBeenCalledWith(
        'token-id',
        {
          used_at: mockDate,
        },
      );
      expect(result).toEqual({ message: 'Password reset successfully' });
    });
  });
});
