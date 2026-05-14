import {
  WebSocketServer,
  WebSocketGateway,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { authSocket } from 'src/common/utils/auth-socket';

type NotificationPayload = {
  recipient_id: string;
  actor_id: string;
  type: string;
  reference_id: string;
  content: string;
};

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    return authSocket(client, this.jwtService);
  }

  sendToUser(userId: string, payload: NotificationPayload) {
    this.server.to(`user_${userId}`).emit('notification', payload);
  }
}
