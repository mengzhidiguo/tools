import { JsonRpc2 } from '@mengzhidiguo/jsonrpc';
import { Button, Input, Layout } from 'antd';
import React from 'react';
import { io } from 'socket.io-client';
import './app.scss';

const { Header, Footer, Sider, Content } = Layout;

const socket = io('http://localhost:3333', {
  path: '/jsonrpc',
});

socket.connect();

function sendResponse(msg: string) {
  console.log(msg);
  socket.emit('jsonrpc-call', msg);
}
const rpcClient = new JsonRpc2({
  timeout: 1000,
  send: sendResponse,
});
socket.on('jsonrpc-call-res', (msg) => {
  rpcClient.receive(msg);
});
class App extends React.Component {

  render() {
    return (
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <Header>Header</Header>
        <Layout>
          <Sider theme={'light'} defaultCollapsed={true}>
            Sider
          </Sider>
          <Content style={{ overflowX: 'hidden', overflowY: 'auto' }}>
            Content
          </Content>
        </Layout>
        <Footer>Footer</Footer>
      </Layout>
    );
  }
}

export default App;
