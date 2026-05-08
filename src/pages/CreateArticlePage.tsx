import React from 'react';
import ArticleForm from '../components/ArticleForm';
import { Layout, Typography } from 'antd';

const { Title } = Typography;
const { Content } = Layout;

const CreateArticlePage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Content style={{ maxWidth: 1200, width: '100%', padding: '24px' }}>
        <Title level={2}>Create New Article</Title>
        <ArticleForm />
      </Content>
    </Layout>
  );
};

export default CreateArticlePage;