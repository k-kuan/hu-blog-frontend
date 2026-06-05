import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, EditOutlined, HomeOutlined, CodeOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const CONTENT_W = 720;

const NavBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/user/login');
  };

  return (
    <div
      style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: CONTENT_W,
          margin: '0 auto',
          padding: '0 16px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* left */}
        <Space size="large">
          <Link to="/blogs" style={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}>
            📝 Hu Blog
          </Link>
          <Link to="/obfuscate" style={{ color: '#333' }}>
            <CodeOutlined style={{ marginRight: 4 }} />
            Obfuscator
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/blogs" style={{ color: '#333' }}>
                <HomeOutlined style={{ marginRight: 4 }} />
                Blogs
              </Link>
              <Link to="/blogs/create" style={{ color: '#333' }}>
                <EditOutlined style={{ marginRight: 4 }} />
                Create
              </Link>
            </>
          )}
        </Space>

        {/* right */}
        <div>
          {isAuthenticated ? (
            <Dropdown
              menu={{
                items: [
                  { key: 'name', label: user?.username ?? 'User', disabled: true },
                  { type: 'divider' as const },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Logout',
                    onClick: handleLogout,
                  },
                ],
              }}
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{user?.username}</span>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button type="link" onClick={() => navigate('/user/login')}>
                Login
              </Button>
              <Button type="primary" size="small" onClick={() => navigate('/user/register')}>
                Register
              </Button>
            </Space>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
