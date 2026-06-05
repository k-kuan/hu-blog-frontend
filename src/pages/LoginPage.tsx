import React from 'react';
import { Typography, Card } from 'antd';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => (
  <div style={{ maxWidth: 400, margin: '40px auto' }}>
    <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
      Login
    </Typography.Title>
    <Card>
      <LoginForm />
    </Card>
  </div>
);

export default LoginPage;
