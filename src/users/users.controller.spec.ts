import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser = { id: 'user-1', name: 'John Doe' };
  const mockRequest = {
    user: mockUser,
  } as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUserProfile: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should call usersService.getUserProfile with authenticated user id', async () => {
      service.getUserProfile.mockResolvedValue(mockUser as any);
      const result = await controller.getProfile(mockRequest);
      expect(result).toEqual(mockUser);
      expect(service.getUserProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getUserProfile', () => {
    it('should call usersService.getUserProfile with param id', async () => {
      service.getUserProfile.mockResolvedValue(mockUser as any);
      const result = await controller.getUserProfile('user-2');
      expect(result).toEqual(mockUser);
      expect(service.getUserProfile).toHaveBeenCalledWith('user-2');
    });
  });

  describe('updateProfile', () => {
    it('should call usersService.updateProfile with user id and dto', async () => {
      const dto = { name: 'New Name' };
      service.updateProfile.mockResolvedValue({ ...mockUser, ...dto } as any);
      const result = await controller.updateProfile(mockRequest, dto);
      expect(result.name).toBe('New Name');
      expect(service.updateProfile).toHaveBeenCalledWith('user-1', dto);
    });
  });
});
