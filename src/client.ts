import 'dotenv/config';
import { io } from 'socket.io-client';
import minimist from 'minimist';

const { host, port, room_id, username, password } = minimist(
  process.argv.slice(2),
  {
    string: ['host', 'port', 'room_id', 'username', 'password'],
    alias: {
      h: 'host',
      p: 'port',
      r: 'room_id',
      u: 'username',
      pw: 'password',
    },
    default: {
      host: 'localhost',
      port: '3000',
      r: '1',
      u: 'Socket',
      pw: 'Password',
    },
  }
);

const authToken = Buffer.from(`${username}:${password}`).toString('base64');

const socket = io(`http://${host}:${port}?room_id=${room_id}`, {
  extraHeaders: {
    authorization: `Basic ${authToken}`,
  },
});

socket.on('connect', () => {
  console.log('Connected');
});

socket.on('disconnect', (reason: string) => {
  console.log('Diconnected', reason);
});

socket.on('message', (payload: any) => {
  console.log(payload);
});

process.stdin.on('data', (data) => {
  const buffered_data = data.toString().replace(/\n/g, '');

  const date = new Date().getTime();

  socket.emit('message', {
    room: room_id,
    messages: [
      {
        id: date,
        created_date: date,
        data: buffered_data,
      },
    ],
  });
});
