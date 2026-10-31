// Ubah ke true untuk mode mock (frontend-only, tanpa backend)
const MOCK_AUTH = false;
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';
import { supabase } from '../services/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<User | null>(null);
  const manualLogout = useRef(false);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (MOCK_AUTH) {
      setIsLoading(false);
      return;
    }
    let active = true;

    // Cek sesi Supabase yang tersimpan saat aplikasi dibuka
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          try {
            const userData = await authService.getProfile();
            if (active) setUser(userData);
          } catch (error) {
            await supabase.auth.signOut();
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        localStorage.removeItem('user');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    checkAuth();

    // Sesi habis / refresh token gagal -> kembali ke halaman login (pengganti interceptor 401)
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_OUT') return;
      const hadUser = userRef.current !== null;
      setUser(null);
      localStorage.removeItem('user');
      if (hadUser && !manualLogout.current) {
        window.location.href = '/auth/login';
      }
      manualLogout.current = false;
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      setUser(response.user);
      return response.user;
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
    manualLogout.current = true;
    localStorage.removeItem('user');
    setUser(null);
    authService.logout().catch(() => {
      manualLogout.current = false;
    });
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
