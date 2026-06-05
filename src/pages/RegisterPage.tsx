import React from 'react';
import { Typography, Card } from 'antd';
import RegisterForm from '../components/RegisterForm';

const RegisterPage: React.FC = () => (
  <div style={{ maxWidth: 400, margin: '40px auto' }}>
    <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
      Register
    </Typography.Title>
    <Card>
      <RegisterForm />
    </Card>
  </div>
);

export default RegisterPage;
