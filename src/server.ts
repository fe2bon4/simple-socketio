import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import miminist from 'minimist';

type SocketMessage = {
  room: string;
  messages: Array<any>;
};

const { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } = process.env;

const { port } = miminist(process.argv.slice(2), {
  string: ['port'],
  alias: { p: 'port' },
  default: {
    port: '3000',
  },
});

const authorize = (authorization: string | undefined): boolean => {
  const decodeBase64 = (str: string) =>
    Buffer.from(str, 'base64').toString('utf-8');

  if (!authorization) return false;
  const [_, token] = authorization.split(' ');

  if (!token) return false;

  const [username, password] = decodeBase64(token).split(':');

  if (!username || !password) return false;

  if (username !== BASIC_AUTH_USERNAME || password !== BASIC_AUTH_PASSWORD)
    return false;

  return true;
};

const isValidPayload = (payload: SocketMessage | undefined): boolean => {
  if (!payload) return false;

  const { room, messages } = payload;

  if (!room || !messages) return false;

  if (!Array.isArray(messages)) return false;

  if (!messages.length) return false;

  return true;
};

const httpServer = createServer();
const io = new Server(httpServer);

io.on('connection', (socket) => {
  const { query, headers } = socket.handshake;

  if (!authorize(headers.authorization)) {
    console.log(`Unauthorized`);
    socket.disconnect();
    return;
  }

  const { room_id } = query;

  console.log(`Connection from socket:${socket.id}`);

  socket.on('message', (payload: SocketMessage) => {
    console.log(payload);
    if (!isValidPayload(payload)) return;

    const { room, messages } = payload;

    io.to(room).emit('message', { room, messages });
  });

  if (room_id) {
    socket.join(room_id);
  }

  socket.on('disconnect', () => {
    console.log(`Disconnected from socket:${socket.id}`);
  });
});

httpServer.listen(parseInt(port));

httpServer.on('listening', () => {
  console.log(`Server listening on port: ${port}`);
});
