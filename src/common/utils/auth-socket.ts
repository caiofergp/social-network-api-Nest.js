import { Socket } from 'socket.io';
import { JwtAdapter } from 'src/adapters/jwt/jwt.dapter';
import * as cookie from 'cookie';

export const authSocket = async (client: Socket, jwtAdapter: JwtAdapter) => {
  try {
    const cookies = client.handshake.headers.cookie;
    const parsedCookies = cookie.parse(cookies ?? '');
    const token = parsedCookies.token;
    const payload = await jwtAdapter.verifyToken(token);
    client.data.userId = payload.id;
    client.join(`user_${payload.id}`);

    return true;
  } catch (error) {
    client.disconnect();

    return false;
  }
};
