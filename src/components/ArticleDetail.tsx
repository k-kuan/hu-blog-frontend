import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Spin, message, Space, Popconfirm, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { blogApi } from '../services/api';
import { Blog } from '../types';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph, Text } = Typography;

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        setArticle(await blogApi.getBlog(Number(id)));
      } catch {
        message.error('Failed to fetch article');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!article) return;
    try {
      await blogApi.deleteBlog(article.id);
      message.success('Deleted');
      navigate('/blogs');
    } catch {
      message.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Title level={2}>Article not found</Title>
        <Button onClick={() => navigate('/blogs')}>Back to Articles</Button>
      </div>
    );
  }

  const isOwner = user?.id === article.userId;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/blogs')}
        style={{ padding: 0, marginBottom: 16 }}
      >
        Back
      </Button>

      <Title level={2} style={{ marginBottom: 8 }}>{article.title}</Title>

      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        {new Date(article.createdAt).toLocaleDateString()}
      </Text>

      <Paragraph style={{ fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
        {article.content}
      </Paragraph>

      {isOwner && (
        <>
          <Divider style={{ marginTop: 40, marginBottom: 20 }} />
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/blogs/${article.id}/edit`)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete this article?"
              description="This cannot be undone."
              onConfirm={handleDelete}
              okText="Delete"
              okType="danger"
              cancelText="Cancel"
            >
              <Button danger icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>
          </Space>
        </>
      )}
    </div>
  );
};

export default ArticleDetail;
