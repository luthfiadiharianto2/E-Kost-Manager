import React, { useEffect, useState } from 'react';
import { Menu, X, Home, User, Building2, Plus, CreditCard, Users, FileText, Map as MapIcon } from 'lucide-react';
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

  // Kunci scroll halaman di belakang menu dan tutup dengan tombol Escape
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const getActiveId = () => {
    const currentPath = location.pathname;
    const found = items.find((it) => it.to && currentPath.startsWith(it.to));
    if (found) return found.id;
    if (currentPath === '/admin' || currentPath === '/tenant') {
      return 'dashboard';
    }
    return 'dashboard';
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
        className="md:hidden fixed top-3 left-4 z-50 bg-navy-900 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto overscroll-contain bg-navy-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <button
                onClick={handleLogoClick}
                className="flex items-center"
              >
                <img src="/img/logo.png" alt="E-Kost Manager" className="h-9 w-auto" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-3">
              <button
                onClick={handleHomeClick}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                active === 'dashboard'
                  ? 'bg-yellow-400 text-navy-900 font-semibold'
                  : 'font-medium text-white/75 hover:bg-white/10 hover:text-white'
              }`}
              >
                <Home className="w-5 h-5 shrink-0" />
                <span>Dashboard</span>
              </button>
              <p className="mt-5 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">Menu</p>

              <div className="space-y-1">
                {items.map((it) => {
                  const isActive = active === it.id;
                  const Icon = it.icon;

                  return (
                    <button
                      key={it.id}
                      onClick={() => handleClick(it)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-yellow-400 text-navy-900 font-semibold'
                          : 'font-medium text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{it.label}</span>
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
