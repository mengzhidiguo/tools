/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as cors from 'cors';
import { JsonRpc2 } from '@mengzhidiguo/jsonrpc';
import { hash } from '@tools/core';

const app = express();

const socketHttp = createServer(app);
const io = new Server(socketHttp, { path: '/jsonrpc', cors: { origin: '*' } });

app.use(cors());

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to server!' });
});

function sendResponse(msg: string) {
  // console.log(msg);
  io.sockets.emit('jsonrpc-call-res', msg);
}
const rpcServer = new JsonRpc2({
  timeout: 1000,
  send: sendResponse,
});

rpcServer.registerRpcCall('hash', hash, []);

io.on('connection', (socket) => {
  socket.on('jsonrpc-call', (msg) => {
    rpcServer.receive(msg);
  });
});

const port = process.env.port || 3333;
const server = socketHttp.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);