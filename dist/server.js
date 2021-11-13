"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var minimist_1 = __importDefault(require("minimist"));
var _a = process.env, BASIC_AUTH_USERNAME = _a.BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD = _a.BASIC_AUTH_PASSWORD;
var port = minimist_1.default(process.argv.slice(2), {
    string: ['port'],
    alias: { p: 'port' },
    default: {
        port: '3000',
    },
}).port;
var authorize = function (authorization) {
    var decodeBase64 = function (str) {
        return Buffer.from(str, 'base64').toString('utf-8');
    };
    if (!authorization)
        return false;
    var _a = authorization.split(' '), _ = _a[0], token = _a[1];
    if (!token)
        return false;
    var _b = decodeBase64(token).split(':'), username = _b[0], password = _b[1];
    if (!username || !password)
        return false;
    if (username !== BASIC_AUTH_USERNAME || password !== BASIC_AUTH_PASSWORD)
        return false;
    return true;
};
var isValidPayload = function (payload) {
    if (!payload)
        return false;
    var room = payload.room, messages = payload.messages;
    if (!room || !messages)
        return false;
    if (!Array.isArray(messages))
        return false;
    if (!messages.length)
        return false;
    return true;
};
var httpServer = http_1.createServer();
var io = new socket_io_1.Server(httpServer);
io.on('connection', function (socket) {
    var _a = socket.handshake, query = _a.query, headers = _a.headers;
    if (!authorize(headers.authorization)) {
        console.log("Unauthorized");
        socket.disconnect();
        return;
    }
    var room_id = query.room_id;
    console.log("Connection from socket:" + socket.id);
    socket.on('message', function (payload) {
        console.log(payload);
        if (!isValidPayload(payload))
            return;
        var room = payload.room, messages = payload.messages;
        io.to(room).emit('message', { room: room, messages: messages });
    });
    if (room_id) {
        socket.join(room_id);
    }
    socket.on('disconnect', function () {
        console.log("Disconnected from socket:" + socket.id);
    });
});
httpServer.listen(parseInt(port));
httpServer.on('listening', function () {
    console.log("Server listening on port: " + port);
});
//# sourceMappingURL=server.js.map