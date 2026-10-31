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
import { AdminLayout } from '../components/AdminLayout';

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
    <AdminLayout>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white rounded-xl shadow-sm p-5" data-aos="fade-up" data-aos-delay={idx * 100}>
                  <div className="flex items-center">
                    <div className={`p-2.5 rounded-lg ${stat.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-xl font-bold text-gray-900 whitespace-nowrap">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-6 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penyewa</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kost</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentPayments.map((p) => (
                            <tr key={p.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.tenant}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{p.kost}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{p.amount}</td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(p.status)}`}>{p.status}</span></td>
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
    </AdminLayout>
  );
};