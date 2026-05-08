import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import api from '../services/api';
import { RegisterRequest } from '../types';

const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: RegisterRequest) => {
    setLoading(true);
    try {
      await api.post('/auth/register', values);
      message.success('Registration successful');
      // Reset form
      form.resetFields();
      // Redirect to login page after successful registration
      window.location.href = '/user/login';
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error('Username or email already exists');
      } else if (error.response?.status === 400) {
        message.error('Invalid input, please check your data');
      } else if (error.response?.status === 500) {
        message.error('Server error, please try again later');
      } else {
        message.error('Registration failed, please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Register" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: 'Please input your username' },
            { min: 3, max: 20, message: 'Username must be between 3 and 20 characters' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email' },
            { type: 'email', message: 'Please input a valid email' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please input your password' },
            { min: 6, max: 20, message: 'Password must be between 6 and 20 characters' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default RegisterForm;