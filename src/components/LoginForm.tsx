import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { LoginRequest } from '../types';

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', values);
      login(res.data.access_token);
      message.success('Login successful');
      navigate('/blogs');
    } catch (error: any) {
      message.error(error.response?.status === 401 ? 'Invalid email or password' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit} size="large">
      <Form.Item name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email' }]}>
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Login
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
