import React, { useState } from 'react';
import { Home, ArrowLeft, User, Building2, Plus, CreditCard, Users, FileText, Menu, Map as MapIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Item = { id: string; label: string; icon: any; to?: string };

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Menu per role
  // map admin items to existing admin dashboard tabs where possible
  const adminItems: Item[] = [
    { id: 'profile', label: 'Profil', icon: User, to: '/admin/profile' },
    { id: 'facilities', label: 'Fasilitas', icon: Building2, to: '/admin/facilities' },
    { id: 'tenants', label: 'Penyewa', icon: Users, to: '/admin/tenants' },
    { id: 'complaints', label: 'Aduan Penyewa', icon: FileText, to: '/admin/complaints' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/admin/payments' },
    { id: 'finance', label: 'Keuangan', icon: CreditCard, to: '/admin/finance' },
    { id: 'layout', label: 'Denah Kost', icon: MapIcon, to: '/admin/layout' },
  ];

  const tenantItems: Item[] = [
    { id: 'overview', label: 'Beranda', icon: Home, to: '/tenant/overview' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/tenant/payments' },
    { id: 'complaints', label: 'Aduan', icon: FileText, to: '/tenant/complaints' },
    { id: 'profile', label: 'Profil', icon: User, to: '/tenant/profile' },
    { id: 'denah', label: 'Denah', icon: MapIcon, to: '/tenant/denah' },
  ];

  const items = user?.role === 'admin' ? adminItems : tenantItems;

  const getActiveId = () => {
    // Check current pathname to determine active item
    const currentPath = location.pathname;

    // Find item that matches current path
    const found = items.find((it) => it.to && currentPath.startsWith(it.to));
    if (found) return found.id;

    // If on /admin (dashboard), return first item
    if (currentPath === '/admin') {
      return 'dashboard';
    }

    // Otherwise, use the first item by default
    return 'dashboard';
  };

  const active = getActiveId();

  // Handle logo click - navigate to landing page
  const handleLogoClick = () => {
    navigate('/');
  };

  // Handle home icon click - go to dashboard
  const handleHomeClick = () => {
    const role = user?.role === 'admin' ? 'admin' : 'tenant';
    navigate(`/${role}`);
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleClick = (it: Item) => {
    if (it.to) navigate(it.to);
  };

  return (
    <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-20' : 'w-56'} bg-navy-900 text-white rounded-r-3xl overflow-y-auto overflow-x-hidden py-6 px-3 transition-all duration-300 h-full`}>
      {/* Header Section */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center relative' : 'justify-between pl-2'} mb-8`}>
        {isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-2 top-0 p-1 rounded-full bg-yellow-400 text-navy-900 hover:bg-yellow-300 transition-all duration-200 z-10"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleLogoClick}
          className={`flex items-center ${isCollapsed ? 'w-full justify-center' : ''}`}
        >
          {isCollapsed ? (
            <img src="/img/logo.png" alt="E-Kost Manager" className="h-10 w-10 object-cover object-left" />
          ) : (
            <img src="/img/logo.png" alt="E-Kost Manager" className="h-9 w-auto" />
          )}
        </button>

        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-yellow-400/20 hover:text-yellow-400 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Home Icon */}
      {isCollapsed && (
        <button
          onClick={handleHomeClick}
          className="w-full flex items-center justify-center mb-4 p-3 rounded-full bg-accent-400/20 hover:bg-yellow-400/30 transition-all duration-200"
        >
          <Home className="w-5 h-5 text-yellow-400" />
        </button>
      )}

      <nav className="mt-2 flex-1">
        {!isCollapsed && (
          <>
            <button
              onClick={handleHomeClick}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active === 'dashboard'
                  ? 'bg-yellow-400 text-navy-900 font-semibold'
                  : 'font-medium text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              <span>Dashboard</span>
            </button>
            <p className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">Menu</p>
          </>
        )}

        <div className={`space-y-1 ${isCollapsed ? 'px-0' : ''}`}>
          {items.map((it) => {
            const isActive = active === it.id;
            const Icon = it.icon;

            if (isCollapsed) {
              return (
                <button
                  key={it.id}
                  onClick={() => handleClick(it)}
                  className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center ${
                    isActive
                      ? 'bg-yellow-400 text-navy-900'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                  title={it.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            }

            return (
              <button
                key={it.id}
                onClick={() => handleClick(it)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-yellow-400 text-navy-900 font-semibold'
                    : 'font-medium text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{it.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
