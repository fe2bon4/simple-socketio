"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var socket_io_client_1 = require("socket.io-client");
var minimist_1 = __importDefault(require("minimist"));
var _a = minimist_1.default(process.argv.slice(2), {
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
}), host = _a.host, port = _a.port, room_id = _a.room_id, username = _a.username, password = _a.password;
var authToken = Buffer.from(username + ":" + password).toString('base64');
var socket = socket_io_client_1.io("http://" + host + ":" + port + "?room_id=" + room_id, {
    extraHeaders: {
        authorization: "Basic " + authToken,
    },
});
socket.on('connect', function () {
    console.log('Connected');
});
socket.on('disconnect', function (reason) {
    console.log('Diconnected', reason);
});
socket.on('message', function (payload) {
    console.log(payload);
});
process.stdin.on('data', function (data) {
    var buffered_data = data.toString().replace(/\n/g, '');
    var date = new Date().getTime();
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
//# sourceMappingURL=client.js.map