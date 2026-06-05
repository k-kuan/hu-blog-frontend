import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { blogApi } from '../services/api';
import { BlogCreateRequest } from '../types';

interface Props {
  initialValues?: BlogCreateRequest;
  onSubmit?: (data: BlogCreateRequest) => Promise<void>;
  buttonText?: string;
}

const ArticleForm: React.FC<Props> = ({
  initialValues = { title: '', content: '' },
  onSubmit,
  buttonText = 'Create Article',
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (values: BlogCreateRequest) => {
    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await blogApi.createBlog(values);
        message.success('Article created!');
        navigate('/blogs');
      }
    } catch {
      message.error('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleFinish}>
      <Form.Item
        name="title"
        label="Title"
        rules={[
          { required: true, message: 'Please enter a title' },
          { min: 3, max: 100, message: 'Title must be 3–100 characters' },
        ]}
      >
        <Input placeholder="Article title" size="large" />
      </Form.Item>

      <Form.Item
        name="content"
        label="Content"
        rules={[
          { required: true, message: 'Please enter content' },
          { min: 10, message: 'Content must be at least 10 characters' },
        ]}
      >
        <Input.TextArea placeholder="Write your article..." rows={16} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} size="large">
          {buttonText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ArticleForm;
