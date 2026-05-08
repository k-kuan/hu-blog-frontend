import React from 'react';
import LoginForm from '../components/LoginForm';
import { Typography, Layout } from 'antd';

const { Title } = Typography;
const { Content } = Layout;

const LoginPage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Content style={{ maxWidth: 500, width: '100%', padding: '24px', textAlign: 'center' }}>
        <Title level={2}>Welcome to Hu Blog</Title>
        <Title level={4}>Please login to continue</Title>
        <LoginForm />
      </Content>
    </Layout>
  );
};

export default LoginPage;