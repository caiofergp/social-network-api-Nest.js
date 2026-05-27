import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { JwtService } from '@nestjs/jwt';
import { NotificationsListener } from 'src/notifications/notifications.listener';

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;
  let prisma: jest.Mocked<PrismaService>;
  let gateway: jest.Mocked<NotificationsGateway>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        NotificationsService,
        NotificationsGateway,
        NotificationsListener,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn().mockResolvedValue({
                id: 'notif-1',
                actor_id: 'actor-1',
                recipient_id: 'recipient-1',
                type: 'follow',
                reference_id: 'ref-1',
              }),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    eventEmitter = app.get(EventEmitter2);
    prisma = app.get(PrismaService);
    gateway = app.get(NotificationsGateway);

    (gateway as any).server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create a notification when follow.created event is emitted', async () => {
    const payload = {
      actorId: 'actor-1',
      actorName: 'John',
      recipientId: 'recipient-1',
      referenceId: 'ref-1',
    };

    await eventEmitter.emitAsync('follow.created', payload);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'follow',
          actor_id: 'actor-1',
          recipient_id: 'recipient-1',
        }),
      }),
    );

    expect((gateway as any).server.to).toHaveBeenCalledWith('user_recipient-1');
    expect((gateway as any).server.emit).toHaveBeenCalledWith(
      'notification',
      expect.objectContaining({
        type: 'follow',
        content: 'John started following you!',
      }),
    );
  });
});
