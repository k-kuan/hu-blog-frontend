import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Spin, Alert, message } from 'antd';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await blogApi.getBlog(Number(id));
        setArticle(data);
      } catch (err) {
        setError('Failed to fetch article');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleEdit = () => {
    if (article) {
      navigate(`/blogs/${article.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!article) return;
    
    try {
      await blogApi.deleteBlog(article.id);
      message.success('Article deleted successfully');
      navigate('/blogs');
    } catch (err) {
      message.error('Failed to delete article');
      console.error('Error deleting article:', err);
    }
  };

  const handleBack = () => {
    navigate('/blogs');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <Alert
          message="Error"
          description={error || 'Article not found'}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={handleBack}>
              Back to Articles
            </Button>
          }
        />
      </div>
    );
  }

  const isOwner = user?.id === article.userId;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <Button 
        type="default" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
        style={{ marginBottom: 20 }}
      >
        Back to Articles
      </Button>
      
      <Typography>
        <Title level={2}>{article.title}</Title>
        <div style={{ marginBottom: 20, display: 'flex', gap: 20, color: '#666' }}>
          <Text>
            Created: {new Date(article.createdAt).toLocaleString()}
          </Text>
          <Text>
            Updated: {new Date(article.updatedAt).toLocaleString()}
          </Text>
        </div>
        <Paragraph style={{ lineHeight: 1.8, fontSize: 16 }}>
          {article.content}
        </Paragraph>
      </Typography>
      
      {isOwner && (
        <div style={{ marginTop: 40, display: 'flex', gap: 10 }}>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={handleEdit}
          >
            Edit Article
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={handleDelete}
          >
            Delete Article
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;