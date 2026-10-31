import React, { useState } from 'react';
import { Menu, X, Home, User, Building2, Plus, CreditCard, Users, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Item = { id: string; label: string; icon: any; to?: string };

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Menu per role
  const adminItems: Item[] = [
    { id: 'profile', label: 'Profil', icon: User, to: '/admin/profile' },
    { id: 'facilities', label: 'Fasilitas', icon: Building2, to: '/admin/facilities' },
    { id: 'tenants', label: 'Penyewa', icon: Users, to: '/admin/tenants' },
    { id: 'complaints', label: 'Aduan Penyewa', icon: FileText, to: '/admin/complaints' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/admin/payments' },
    { id: 'finance', label: 'Keuangan', icon: CreditCard, to: '/admin/finance' },
  ];

  const tenantItems: Item[] = [
    { id: 'overview', label: 'Beranda', icon: Home, to: '/tenant/overview' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/tenant/payments' },
    { id: 'complaints', label: 'Aduan', icon: FileText, to: '/tenant/complaints' },
    { id: 'profile', label: 'Profil', icon: User, to: '/tenant/profile' },
  ];

  const items = user?.role === 'admin' ? adminItems : tenantItems;

  const getActiveId = () => {
    const currentPath = location.pathname;
    const found = items.find((it) => it.to && currentPath.startsWith(it.to));
    if (found) return found.id;
    if (currentPath === '/admin' || currentPath === '/tenant') {
      return items[0].id;
    }
    return items[0].id;
  };

  const active = getActiveId();

  const handleLogoClick = () => {
    navigate('/');
    setIsOpen(false);
  };

  const handleHomeClick = () => {
    const role = user?.role === 'admin' ? 'admin' : 'tenant';
    navigate(`/${role}`);
    setIsOpen(false);
  };

  const handleClick = (it: Item) => {
    if (it.to) navigate(it.to);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-navy-900 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-80 bg-navy-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-navy-700">
              <button
                onClick={handleLogoClick}
                className="flex items-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent-400 flex items-center justify-center mr-3 overflow-hidden">
                  <img src="/img/logo.png" alt="Logo" className="h-12 w-12 object-cover" />
                </div>
                <div>
                  <p className="font-bold text-sm">KOST</p>
                  <p className="text-xs text-white/70">MANAGER</p>
                </div>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4">
              <button
                onClick={handleHomeClick}
                className="w-full flex items-center justify-center mb-6 p-3 rounded-full bg-accent-400/20 hover:bg-yellow-400/30 transition-all duration-200 group"
              >
                <Home className="w-5 h-5 text-yellow-400 mr-3" />
                <span className="text-white font-medium">Dashboard</span>
              </button>

              <div className="space-y-2">
                {items.map((it) => {
                  const isActive = active === it.id;
                  const Icon = it.icon;

                  return (
                    <button
                      key={it.id}
                      onClick={() => handleClick(it)}
                      className={`w-full flex items-center p-4 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-yellow-400 text-navy-900 font-semibold shadow-md'
                          : 'bg-white text-navy-900/90 hover:bg-yellow-50 hover:text-navy-900 hover:shadow-sm'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="text-sm">{it.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
