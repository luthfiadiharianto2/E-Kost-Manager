import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';
import InviteTenant from './InviteTenant';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-clip">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile Menu */}
      <MobileMenu />

      <div className="flex-1 min-w-0 md:ml-56 w-full">
        <header className="sticky top-0 z-40 bg-white text-black border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between md:justify-end items-center h-16">
              {/* Mobile Logo - only visible on mobile */}
              <div className="md:hidden flex items-center pl-12">
                <img src="/img/logo.png" alt="E-Kost Manager" className="h-7 w-auto" />
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-right hidden sm:block mr-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-600">Pemilik Kost</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-navy-900 text-white px-3 md:px-4 h-9 rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
                >
                  <span className="hidden sm:inline">Invite Tenant</span>
                  <span className="sm:hidden">Invite</span>
                </button>
                <button
                  onClick={logout}
                  className="bg-accent-500 text-navy-900 px-3 md:px-4 h-9 rounded-lg hover:bg-accent-400 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {showInviteModal && user && (
          <InviteTenant ownerId={user.id} onClose={() => setShowInviteModal(false)} />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

