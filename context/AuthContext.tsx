import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { apiFetchUser, apiLogin, apiLogout, apiRegister, LoginCredentials, RegisterCredentials } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await apiFetchUser();
        setUser(userData);
      } catch (error) {
        console.info("User is not authenticated on startup.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { user } = await apiLogin(credentials);
    setUser(user);
  };

  const register = async (credentials: RegisterCredentials) => {
    const { user } = await apiRegister(credentials);
    setUser(user);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout failed on server:', error);
    }
    
    setUser(null);
  };
  
  const updateUser = (updatedUserData: User) => {
    setUser(updatedUserData);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};