import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as unknown as Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('sendToUser', () => {
    it('should emit notification to the correct room', () => {
      const payload = {
        recipient_id: 'user-1',
        actor_id: 'actor-1',
        type: 'follow',
        reference_id: 'ref-1',
        content: 'hello',
      };

      gateway.sendToUser('user-1', payload);

      expect(mockServer.to).toHaveBeenCalledWith('user_user-1');
      expect(mockServer.emit).toHaveBeenCalledWith('notification', payload);
    });
  });
});
