
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateArticlePage from './pages/CreateArticlePage';
import EditArticlePage from './pages/EditArticlePage';
import NavBar from './components/NavBar';
import ArticleDetail from './components/ArticleDetail';
import ArticleList from './components/ArticleList';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ padding: 24 }}>
          <NavBar />
          <Routes>
            <Route path="/user/login" element={<LoginPage />} />
            <Route path="/user/register" element={<RegisterPage />} />
            <Route path="/blogs" element={<ArticleList />} />
            <Route path="/blogs/:id" element={<ArticleDetail />} />
            <Route path="/" element={<div>Home Page</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/blogs/create" element={<CreateArticlePage />} />
              <Route path="/blogs/:id/edit" element={<EditArticlePage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;