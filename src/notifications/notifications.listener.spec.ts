import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsListener, BaseNotificationPayload } from './notifications.listener';
import { NotificationsService } from './notifications.service';

describe('NotificationsListener', () => {
  let listener: NotificationsListener;
  let service: jest.Mocked<NotificationsService>;

  const mockPayload: BaseNotificationPayload = {
    actorId: 'actor-1',
    actorName: 'Actor',
    recipientId: 'recipient-1',
    referenceId: 'ref-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsListener,
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    listener = module.get<NotificationsListener>(NotificationsListener);
    service = module.get(NotificationsService);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  it('should handle post.liked event', async () => {
    await listener.handlePostLiked(mockPayload);
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({
      type: 'like',
      actor_id: 'actor-1',
    }));
  });

  it('should handle follow.created event', async () => {
    await listener.handleFollowCreated(mockPayload);
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({
      type: 'follow',
      content: 'Actor started following you!',
    }));
  });

  it('should handle chat.message.created event', async () => {
    await listener.handleMessageCreated(mockPayload);
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({
      type: 'chat',
      content: 'Actor sent you a message!',
    }));
  });
});
