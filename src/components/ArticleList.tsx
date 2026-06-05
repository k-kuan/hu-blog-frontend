import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination, Typography, Spin, message, Empty } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { blogApi } from '../services/api';
import { Blog } from '../types';

const { Title, Text } = Typography;

const ArticleList: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await blogApi.getBlogs(page, limit);
      if (data?.data) {
        setArticles(data.data);
        setTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        setArticles(data);
        setTotal(data.length);
      }
    } catch {
      message.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Title level={2}>Articles</Title>

      <Spin spinning={loading}>
        {articles.length === 0 && !loading ? (
          <Empty description="No articles yet" />
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              onClick={() => navigate(`/blogs/${article.id}`)}
              style={{
                cursor: 'pointer',
                background: '#fff',
                borderRadius: 8,
                padding: '16px 20px',
                marginBottom: 12,
                border: '1px solid #f0f0f0',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <FileTextOutlined style={{ fontSize: 22, color: '#1677ff', marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>
                  {article.title}
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ''}
                </Text>
                <Text
                  ellipsis
                  type="secondary"
                  style={{ display: 'block', marginTop: 6, fontSize: 14 }}
                >
                  {article.content || ''}
                </Text>
              </div>
            </div>
          ))
        )}
      </Spin>

      {total > limit && (
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
          showTotal={(t) => `Total ${t} articles`}
          style={{ textAlign: 'center', marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default ArticleList;
