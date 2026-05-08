import React from 'react';
import RegisterForm from '../components/RegisterForm';
import { Typography, Layout } from 'antd';

const { Title } = Typography;
const { Content } = Layout;

const RegisterPage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Content style={{ maxWidth: 500, width: '100%', padding: '24px', textAlign: 'center' }}>
        <Title level={2}>Welcome to Hu Blog</Title>
        <Title level={4}>Please register to continue</Title>
        <RegisterForm />
      </Content>
    </Layout>
  );
};

export default RegisterPage;