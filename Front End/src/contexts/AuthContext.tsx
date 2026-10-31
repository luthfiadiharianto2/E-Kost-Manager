// Ubah ke true untuk mode mock (frontend-only, tanpa backend)
const MOCK_AUTH = false;
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginFormData } from '../types';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (MOCK_AUTH) {
      setIsLoading(false);
      return;
    }
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');

        // Check backend jika token ada
        if (token) {
          try {
            const userData = await authService.getProfile();
            setUser(userData);
          } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      // Simpan token terlebih dahulu agar request berikutnya terautentikasi
      localStorage.setItem('token', response.token);

      // Setelah login, ambil profil terbaru dari backend (termasuk avatar URL)
      const userData = await authService.getProfile();
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (MOCK_AUTH) {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};