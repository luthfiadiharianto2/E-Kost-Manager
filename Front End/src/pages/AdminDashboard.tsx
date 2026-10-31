 import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useLocation } from 'react-router-dom';
import InviteTenant from '../components/InviteTenant';
import { ProfileSection } from '../components/ProfileSection';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const location = useLocation();

  useEffect(() => {
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      AOS.init({ duration: 600, easing: 'ease-in-out', once: true });
    };
    initAOS();
  }, []);

  // sync active tab with ?tab= query param (so sidebar navigation works)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Mock data
  const stats = [
    { name: 'Total Kost', value: '12', icon: Building2, color: 'bg-blue-500' },
    { name: 'Total Penyewa', value: '45', icon: Users, color: 'bg-green-500' },
    { name: 'Pembayaran Bulan Ini', value: 'Rp 15.2M', icon: CreditCard, color: 'bg-yellow-500' },
    { name: 'Pengaduan Aktif', value: '3', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const recentPayments = [
    { id: 1, tenant: 'John Doe', kost: 'Kost ABC', amount: 'Rp 1.500.000', status: 'paid', date: '2024-01-15' },
    { id: 2, tenant: 'Jane Smith', kost: 'Kost XYZ', amount: 'Rp 1.200.000', status: 'pending', date: '2024-01-14' },
  ];

  const recentComplaints = [
    { id: 1, tenant: 'John Doe', title: 'AC Tidak Dingin', status: 'pending', priority: 'high' },
    { id: 2, tenant: 'Jane Smith', title: 'WiFi Lambat', status: 'in_progress', priority: 'medium' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [showInviteModal, setShowInviteModal] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-navy-900 text-white p-2 rounded-lg shadow-lg mr-2"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 md:ml-56">
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
                  <p className="text-xs text-gray-600">Pemilik Kost</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-navy-900 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-navy-800 transition-colors text-sm"
                >
                  <span className="hidden sm:inline">Invite Tenant</span>
                  <span className="sm:hidden">Invite</span>
                </button>
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

        {showInviteModal && user && (
          <InviteTenant ownerId={user.id} onClose={() => setShowInviteModal(false)} />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6" data-aos="fade-up" data-aos-delay={idx * 100}>
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', name: 'Overview' },
                  { id: 'profile', name: 'Profil' },
                  { id: 'kosts', name: 'Kost' },
                  { id: 'tenants', name: 'Penyewa' },
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div data-aos="fade-up">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Pembayaran Terbaru</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penyewa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kost</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentPayments.map((p) => (
                            <tr key={p.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.tenant}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.kost}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.amount}</td>
                              <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(p.status)}`}>{p.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && user && (
                <ProfileSection 
                  user={user} 
                  onUpdate={(updatedUser) => {
                    // Update user in context if needed
                    // The ProfileSection already handles this via useAuth
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};