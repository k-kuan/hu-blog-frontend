import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import CreateArticlePage from './pages/CreateArticlePage';
import EditArticlePage from './pages/EditArticlePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CodeObfuscatePage from './pages/CodeObfuscatePage';
import PromptGeneratorPage from './pages/PromptGeneratorPage';
import './App.css';

const App = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 6,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      },
    }}
  >
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
          <NavBar />
          <div style={{ padding: '24px 16px' }}>
            <Routes>
              {/* public */}
              <Route path="/user/login" element={<LoginPage />} />
              <Route path="/user/register" element={<RegisterPage />} />
              <Route path="/obfuscate" element={<CodeObfuscatePage />} />
              <Route path="/prompt-generator" element={<PromptGeneratorPage />} />
              {/* protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<ArticleList />} />
                <Route path="/blogs" element={<ArticleList />} />
                <Route path="/blogs/create" element={<CreateArticlePage />} />
                <Route path="/blogs/:id" element={<ArticleDetail />} />
                <Route path="/blogs/:id/edit" element={<EditArticlePage />} />
              </Route>
              {/* catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  </ConfigProvider>
);

export default App;
