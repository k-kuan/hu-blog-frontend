import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const NavBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/user/login');
  };

  const menuItems = [
    {
      key: 'home',
      label: <Link to="/blogs">Blog List</Link>,
      icon: <HomeOutlined />,
    },
  ];

  if (isAuthenticated) {
    menuItems.push(
      {
        key: 'create',
        label: <Link to="/blogs/create">Create Post</Link>,
        icon: <EditOutlined />,
      }
    );
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <span>{user?.username}</span>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ marginBottom: 24 }}>
      <Menu mode="horizontal" items={menuItems} />
      <div style={{ float: 'right', marginTop: -48 }}>
        {isAuthenticated ? (
          <Dropdown overlay={userMenu} trigger={['click']}>
            <Space>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.username}</span>
            </Space>
          </Dropdown>
        ) : (
          <>
            <Button type="link" onClick={() => navigate('/user/login')}>
              Login
            </Button>
            <Button type="primary" onClick={() => navigate('/user/register')}>
              Register
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;