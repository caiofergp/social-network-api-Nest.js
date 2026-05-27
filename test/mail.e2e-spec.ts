import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { getQueueToken } from '@nestjs/bullmq';
import { User } from 'src/users/entities/user.entity';

describe('MailModule (e2e)', () => {
  let app: INestApplication;
  let service: MailService;
  let queue: any;

  beforeEach(async () => {
    const queueMock = {
      add: jest.fn().mockResolvedValue({ id: '1' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: getQueueToken('mail_queue'),
          useValue: queueMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = app.get<MailService>(MailService);
    queue = app.get(getQueueToken('mail_queue'));
  });

  afterEach(async () => {
    await app.close();
  });

  it('should add confirm_account job to queue', async () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test' };
    const token = 'token';

    await service.sendConfirmAccountEmail(user as User, token);

    expect(queue.add).toHaveBeenCalled();
  });
});
