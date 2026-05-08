import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserInfo } from '../types';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage on component mount
    const token = localStorage.getItem('access_token');
    if (token) {
      // Decode token to get user info
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: tokenPayload.id,
          username: tokenPayload.username,
          email: tokenPayload.email
        });
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid token, clear it
        localStorage.removeItem('access_token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  const login = (token: string) => {
    // Store token in localStorage
    localStorage.setItem('access_token', token);
    
    // Decode token to get user info
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: tokenPayload.id,
        username: tokenPayload.username,
        email: tokenPayload.email
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
