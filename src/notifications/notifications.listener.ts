import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';

export class BaseNotificationPayload {
  actorName: string;
  actorId: string;
  recipientId: string;
  referenceId: string;

  constructor(payload: BaseNotificationPayload) {
    this.actorName = payload.actorName;
    this.actorId = payload.actorId;
    this.recipientId = payload.recipientId;
    this.referenceId = payload.referenceId;
  }
}

enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  FOLLOW = 'follow',
}

@Injectable()
export class NotificationsListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('post.liked')
  async handlePostLiked(payload: BaseNotificationPayload) {
    await this.notificationsService.create({
      actor_id: payload.actorId,
      recipient_id: payload.recipientId,
      type: NotificationType.LIKE,
      content: `${payload.actorName} liked your post!`,
      reference_id: payload.referenceId,
    });
  }

  @OnEvent('post.shared')
  async handlePostShared(payload: BaseNotificationPayload) {
    await this.notificationsService.create({
      actor_id: payload.actorId,
      recipient_id: payload.recipientId,
      type: NotificationType.SHARE,
      content: `${payload.actorName} shared your post!`,
      reference_id: payload.referenceId,
    });
  }

  @OnEvent('comment.created')
  async handleCommentCreated(payload: BaseNotificationPayload) {
    await this.notificationsService.create({
      actor_id: payload.actorId,
      recipient_id: payload.recipientId,
      type: NotificationType.COMMENT,
      content: `${payload.actorName} commented on your post!`,
      reference_id: payload.referenceId,
    });
  }

  @OnEvent('comment.liked')
  async handleCommentLiked(payload: BaseNotificationPayload) {
    await this.notificationsService.create({
      actor_id: payload.actorId,
      recipient_id: payload.recipientId,
      type: NotificationType.COMMENT,
      content: `${payload.actorName} liked your comment!`,
      reference_id: payload.referenceId,
    });
  }

  @OnEvent('follow.created')
  async handleFollowCreated(payload: BaseNotificationPayload) {
    await this.notificationsService.create({
      actor_id: payload.actorId,
      recipient_id: payload.recipientId,
      type: NotificationType.FOLLOW,
      content: `${payload.actorName} started following you!`,
      reference_id: payload.referenceId,
    });
  }
}
