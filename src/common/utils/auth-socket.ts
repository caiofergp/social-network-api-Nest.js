import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';

export const authSocket = async (client: Socket, jwtService: JwtService) => {
  try {
    const cookies = client.handshake.headers.cookie;
    const parsedCookies = cookie.parse(cookies ?? '');
    const token = parsedCookies.token;
    const payload = await jwtService.verifyAsync(token);
    client.data.userId = payload.id;
    client.join(`user_${payload.id}`);

    return true;
  } catch (error) {
    client.disconnect();

    return false;
  }
};
