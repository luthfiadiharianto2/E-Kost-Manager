import React from 'react';
import { Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';

interface TenantLayoutProps {
  children: React.ReactNode;
}

export const TenantLayout: React.FC<TenantLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile Menu */}
      <MobileMenu />

      <div className="flex-1 md:ml-56 w-full">
        <header className="bg-white text-black border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between md:justify-end items-center py-4">
              {/* Mobile Logo - only visible on mobile */}
              <div className="md:hidden flex items-center">
                <div className="w-8 h-8 rounded-full bg-accent-400 flex items-center justify-center overflow-hidden">
                  <img src="/img/logo.png" alt="Logo" className="h-8 w-8 object-cover" />
                </div>
                <div className="ml-2">
                  <p className="font-bold text-xs">KOST MANAGER</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-600">Penyewa</p>
                </div>
                <button
                  onClick={logout}
                  className="bg-accent-500 text-navy-900 px-3 py-2 md:px-4 rounded-lg hover:bg-accent-400 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

