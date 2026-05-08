import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { blogApi } from '../services/api';
import { BlogCreateRequest } from '../types';
import { useNavigate } from 'react-router-dom';

interface ArticleFormProps {
  initialValues?: BlogCreateRequest;
  onSubmit?: (data: BlogCreateRequest) => void;
  buttonText?: string;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  initialValues = { title: '', content: '' },
  onSubmit,
  buttonText = 'Create Article'
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: BlogCreateRequest) => {
    try {
      setLoading(true);
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await blogApi.createBlog(values);
        message.success('Article created successfully!');
        navigate('/blogs');
      }
    } catch (error) {
      message.error('Failed to create article. Please try again.');
      console.error('Error creating article:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={buttonText} style={{ margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Please input article title!' },
            { min: 3, message: 'Title must be at least 3 characters' },
            { max: 100, message: 'Title must not exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter article title" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Content"
          rules={[
            { required: true, message: 'Please input article content!' },
            { min: 10, message: 'Content must be at least 10 characters' }
          ]}
        >
          <Input.TextArea 
            placeholder="Enter article content" 
            rows={10} 
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {buttonText}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ArticleForm;