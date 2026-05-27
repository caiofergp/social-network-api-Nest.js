import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { Notification } from './entities/notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let gateway: jest.Mocked<NotificationsGateway>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationsGateway,
          useValue: {
            sendToUser: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    gateway = module.get(NotificationsGateway);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification and send it via gateway', async () => {
      const mockNotification = {
        id: 'notif-1',
        actor_id: 'actor-1',
        recipient_id: 'recipient-1',
        type: 'follow',
        reference_id: 'ref-1',
      };

      jest
        .mocked(prisma.notification.create)
        .mockResolvedValue(mockNotification as Notification);

      const data = {
        actor_id: 'actor-1',
        recipient_id: 'recipient-1',
        type: 'follow',
        reference_id: 'ref-1',
        content: 'Test content',
      };

      await service.create(data);

      expect(prisma.notification.create).toHaveBeenCalled();
      expect(gateway.sendToUser).toHaveBeenCalledWith(
        'recipient-1',
        expect.objectContaining({
          content: 'Test content',
          type: 'follow',
        }),
      );
    });
  });
});
