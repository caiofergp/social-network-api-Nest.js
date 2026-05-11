import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAdapter } from 'src/adapters/jwt/jwt.dapter';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseNotificationPayload } from 'src/notifications/notifications.listener';
import { UnitOfWork } from 'src/db/unit-of-work';
import { authSocket } from 'src/common/utils/auth-socket';
import { SendMessageDto } from './dto/send-message.dto';

enum WsStatus {
  SENT = 'sent',
  FAILED = 'failed',
}

type WsResponsePayload = {
  status: WsStatus;
  data: Message | string;
};

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly eventEmitter: EventEmitter2,
    private readonly unitOfWork: UnitOfWork,
    private readonly jwtAdapter: JwtAdapter,
  ) {}

  async handleConnection(client: Socket) {
    return await authSocket(client, this.jwtAdapter);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ): Promise<WsResponsePayload> {
    const senderId = client.data.userId;

    return await this.unitOfWork.runInTransaction(async () => {
      const msg = await this.chatService.saveMessage(
        senderId,
        payload.chatId,
        payload.content,
        payload.medias,
      );

      const chat = await this.chatService.getChatById(payload.chatId);

      if (!chat) {
        return { status: WsStatus.FAILED, data: 'Chat not found' };
      }

      const sender = chat.members?.find(
        (member) => member?.user?.id === senderId,
      );

      if (!sender) {
        return { status: WsStatus.FAILED, data: 'User not found' };
      }

      if (!chat?.members) {
        return { status: WsStatus.FAILED, data: 'Chat members not found' };
      }

      for (const member of chat.members) {
        if (member?.user?.id !== senderId) {
          this.eventEmitter.emitAsync(
            'chat.message.created',
            new BaseNotificationPayload({
              actorId: senderId,
              recipientId: member?.user?.id!,
              referenceId: chat.id,
              actorName: sender!.user?.name!,
            }),
          );

          this.server.to(`user_${member?.user?.id}`).emit('new_message', msg);
        }
      }

      return { status: WsStatus.SENT, data: msg };
    });
  }
}
