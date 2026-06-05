import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import api from '../services/api';
import { RegisterRequest } from '../types';

const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterRequest) => {
    setLoading(true);
    try {
      await api.post('/auth/register', values);
      message.success('Registration successful — please login');
      navigate('/user/login');
    } catch (error: any) {
      const status = error.response?.status;
      message.error(
        status === 409 ? 'Username or email already exists' :
        status === 400 ? 'Invalid input' :
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit} size="large">
      <Form.Item name="username" rules={[{ required: true, message: 'Please enter a username' }, { min: 3, max: 20 }]}>
        <Input prefix={<UserOutlined />} placeholder="Username" />
      </Form.Item>
      <Form.Item name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email' }]}>
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: 'Please enter a password' }, { min: 6, max: 20 }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Register
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;
