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

function decodeToken(token: string): { user: UserInfo; expired: boolean } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expired = payload.exp ? payload.exp * 1000 < Date.now() : false;
    return {
      user: {
        id: payload.id,
        username: payload.username,
        email: payload.email,
      },
      expired,
    };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && !decoded.expired) {
        setUser(decoded.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    const decoded = decodeToken(token);
    if (decoded && !decoded.expired) {
      setUser(decoded.user);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
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
