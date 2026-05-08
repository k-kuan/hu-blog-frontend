import React, { useState, useEffect } from 'react';
import { List, Pagination, Typography, Card, Spin, message } from 'antd';
import { Link } from 'react-router-dom';
import { blogApi } from '../services/api';
import { Blog } from '../types';

const { Title, Text } = Typography;

const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getBlogs(page, limit);
      // 检查返回的数据结构
      if (data && data.data) {
        setArticles(data.data);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setLimit(data.limit || 10);
      } else {
        // 如果返回的数据结构不对，可能是直接返回了数组
        if (Array.isArray(data)) {
          setArticles(data);
          setTotal(data.length);
        } else {
          console.error('Unexpected API response structure:', data);
          message.error('Failed to fetch articles: Invalid data format');
        }
      }
    } catch (error) {
      message.error('Failed to fetch articles');
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, limit]);

  const handlePageChange = (current: number, pageSize: number) => {
    setPage(current);
    setLimit(pageSize);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Articles</Title>
      <Spin spinning={loading} tip="Loading articles...">
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={articles}
          renderItem={(article) => (
            <List.Item>
              <Card
                hoverable
                actions={[
                  <Link key="view" to={`/blogs/${article.id}`}>
                    View
                  </Link>
                ]}
              >
                <Card.Meta
                  title={
                    <Link to={`/blogs/${article.id}`}>
                      {article.title}
                    </Link>
                  }
                  description={
                    <>
                      <Text type="secondary">
                        Created: {article.createdAt ? new Date(article.createdAt).toLocaleString() : 'Unknown'}
                      </Text>
                      <br />
                      <Text ellipsis>
                        {article.content || 'No content available'}
                      </Text>
                    </>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Spin>
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          pageSizeOptions={[10, 20, 50]}
          showTotal={(total) => `Total ${total} articles`}
        />
      </div>
    </div>
  );
};

export default ArticleList;