import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from 'src/db/prisma/prisma.service';

type CreateNotificationData = {
  actor_id: string;
  reference_id: string;
  recipient_id: string;
  type: string;
  content: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly gateway: NotificationsGateway,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateNotificationData) {
    const notification = await this.prisma.notification.create({
      data: {
        recipient_id: data.recipient_id,
        actor_id: data.actor_id,
        type: data.type,
        reference_id: data.reference_id,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
          },
        },
        followedUser: {
          select: {
            id: true,
          },
        },
      },
    });

    this.gateway.sendToUser(data.recipient_id, {
      actor_id: notification.actor_id,
      recipient_id: notification.recipient_id,
      type: notification.type,
      reference_id: notification.reference_id,
      content: data.content,
    });
  }
}
