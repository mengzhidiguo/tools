import { Button, Layout, Input } from 'antd';
import React from 'react';
import { io } from 'socket.io-client';
import './app.scss';
import { JsonRpc2 } from '@mengzhidiguo/jsonrpc/dist';

const { Header, Footer, Sider, Content } = Layout;

const socket = io('http://localhost:3333', {
  path: '/jsonrpc',
});

socket.connect();
socket.on('jsonrpc-call-res', (msg) => {
  console.log(msg);
});

function sendResponse(msg: string) {
  console.log(msg);
  socket.emit('jsonrpc-call', msg);
}
console.log(JsonRpc2);
const rpcClient = new JsonRpc2({
  timeout: 1000,
  send: sendResponse,
});

export function App() {
  function handleClick(e) {
    e.preventDefault();
    console.log('The link was clicked.');
    socket.emit('jsonrpc-call', 'd');
  }
  const template = (
    <div>
      <Layout>
        <Layout>
          <Content>
            <Input type="text" placeholder="调用"></Input>
            <Input type="file" placeholder="请选择文件"></Input>
            <Button type="primary" onClick={handleClick}>
              计算
            </Button>
          </Content>
        </Layout>
      </Layout>
    </div>
  );

  return template;
}

export default App;
