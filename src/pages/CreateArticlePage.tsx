import React from 'react';
import { Typography } from 'antd';
import ArticleForm from '../components/ArticleForm';

const CreateArticlePage: React.FC = () => (
  <div style={{ maxWidth: 720, margin: '0 auto' }}>
    <Typography.Title level={2}>Create New Article</Typography.Title>
    <ArticleForm />
  </div>
);

export default CreateArticlePage;
