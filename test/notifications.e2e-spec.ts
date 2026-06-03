import 'dotenv/config';
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
  let prisma: PrismaService;
  let gateway: NotificationsGateway;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        NotificationsService,
        NotificationsGateway,
        NotificationsListener,
        PrismaService,
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

  afterAll(async () => {
    eventEmitter.removeAllListeners();
    await prisma.$disconnect();
    await app.close();
  });

  it('should create a notification when follow.created event is emitted', async () => {
    const actor = await prisma.user.create({
      data: {
        id: 'actor-1',
        name: 'John',
        email: 'john@example.com',
        password: 'pass',
      },
    });
    const recipient = await prisma.user.create({
      data: {
        id: 'recipient-1',
        name: 'Jane',
        email: 'jane@example.com',
        password: 'pass',
      },
    });

    const payload = {
      actorId: actor.id,
      actorName: actor.name,
      recipientId: recipient.id,
      referenceId: 'ref-1',
    };

    await eventEmitter.emitAsync('follow.created', payload);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const notification = await prisma.notification.findFirst({
      where: { recipient_id: recipient.id },
    });

    expect(notification).toBeDefined();
    expect(notification?.type).toBe('follow');

    expect((gateway as any).server.to).toHaveBeenCalledWith('user_recipient-1');
  });
});
