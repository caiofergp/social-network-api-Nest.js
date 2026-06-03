import { Test, TestingModule } from '@nestjs/testing';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';

describe('FollowsController', () => {
  let controller: FollowsController;
  let service: jest.Mocked<FollowsService>;

  const mockRequest = {
    user: { id: 'user-1', name: 'John Doe' },
  } as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowsController],
      providers: [
        {
          provide: FollowsService,
          useValue: {
            follow: jest.fn(),
            unfollow: jest.fn(),
            getFollowers: jest.fn(),
            getFollowing: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FollowsController>(FollowsController);
    service = module.get(FollowsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFollowers', () => {
    it('should call service.getFollowers', async () => {
      service.getFollowers.mockResolvedValue([]);
      await controller.getFollowers('user-1');
      expect(service.getFollowers).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getFollowing', () => {
    it('should call service.getFollowing', async () => {
      service.getFollowing.mockResolvedValue([]);
      await controller.getFollowing('user-1');
      expect(service.getFollowing).toHaveBeenCalledWith('user-1');
    });
  });

  describe('follow', () => {
    it('should call service.follow', async () => {
      service.follow.mockResolvedValue({} as any);
      await controller.follow(mockRequest, 'user-2');
      expect(service.follow).toHaveBeenCalledWith(mockRequest.user, 'user-2');
    });
  });

  describe('unfollow', () => {
    it('should call service.unfollow', async () => {
      service.unfollow.mockResolvedValue({} as any);
      await controller.unfollow(mockRequest, 'user-2');
      expect(service.unfollow).toHaveBeenCalledWith(mockRequest.user, 'user-2');
    });
  });
});
