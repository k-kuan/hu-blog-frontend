import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, message } from 'antd';
import ArticleForm from '../components/ArticleForm';
import { blogApi } from '../services/api';
import { Blog, BlogCreateRequest } from '../types';

const EditArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        setArticle(await blogApi.getBlog(Number(id)));
      } catch {
        message.error('Failed to load article');
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleUpdate = async (values: BlogCreateRequest) => {
    if (!id) return;
    try {
      await blogApi.updateBlog(Number(id), values);
      message.success('Article updated!');
      navigate(`/blogs/${id}`);
    } catch {
      message.error('Failed to update article');
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
        <Typography.Title level={2}>Article not found</Typography.Title>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Typography.Title level={2}>Edit Article</Typography.Title>
      <ArticleForm
        initialValues={{ title: article.title, content: article.content }}
        onSubmit={handleUpdate}
        buttonText="Update Article"
      />
    </div>
  );
};

export default EditArticlePage;
