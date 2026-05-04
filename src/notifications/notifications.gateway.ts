import {
  WebSocketServer,
  WebSocketGateway,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type NotificationPayload = {
  recipient_id: string;
  actor_id: string;
  type: string;
  reference_id: string;
  content: string;
};

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  sendToUser(userId: string, payload: NotificationPayload) {
    this.server.to(`user_${userId}`).emit('notification', payload);
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;

    if (userId) client.join(`user_${userId}`);
  }
}
