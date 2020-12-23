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
import { join } from 'path';
import * as open from 'open';
import { exit } from 'process';
import { environment } from './environments/environment';

const app = express();

const socketHttp = createServer(app);
const io = new Server(socketHttp, { path: '/jsonrpc', cors: { origin: '*' } });

app.use(cors());
app.get('/api', (req, res) => {
  res.send({ message: 'Ok!' });
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
const server = socketHttp.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}`);
  if (environment.production) {
    app.use('/', express.static(join(__dirname, '../', 'shell')));
    await open(`http://localhost:${port}`).catch(() => exit());
  }
});
server.on('error', console.error);
