import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Spin, Layout, Typography } from 'antd';
import ArticleForm from '../components/ArticleForm';
import { blogApi } from '../services/api';
import { Blog, BlogCreateRequest } from '../types';

const { Title } = Typography;
const { Content } = Layout;

const EditArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await blogApi.getBlog(Number(id));
        setArticle(data);
      } catch (error) {
        message.error('Failed to load article. Please try again.');
        console.error('Error loading article:', error);
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, navigate]);

  const handleUpdate = async (values: BlogCreateRequest) => {
    if (!id) return;
    
    try {
      await blogApi.updateBlog(Number(id), values);
      message.success('Article updated successfully!');
      navigate(`/blogs/${id}`);
    } catch (error) {
      message.error('Failed to update article. Please try again.');
      console.error('Error updating article:', error);
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Content style={{ maxWidth: 1200, width: '100%', padding: '24px' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Content style={{ maxWidth: 1200, width: '100%', padding: '24px' }}>
          <Title level={2}>Article not found</Title>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Content style={{ maxWidth: 1200, width: '100%', padding: '24px' }}>
        <Title level={2}>Edit Article</Title>
        <ArticleForm
          initialValues={{ title: article.title, content: article.content }}
          onSubmit={handleUpdate}
          buttonText="Update Article"
        />
      </Content>
    </Layout>
  );
};

export default EditArticlePage;