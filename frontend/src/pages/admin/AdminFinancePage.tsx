import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { CreditCard, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const AdminFinancePage: React.FC = () => {
  // Mock data
  const stats = [
    { label: 'Total Pendapatan', value: 'Rp 45.000.000', icon: DollarSign, color: 'bg-green-500', trend: '+12%' },
    { label: 'Pendapatan Bulan Ini', value: 'Rp 15.000.000', icon: TrendingUp, color: 'bg-blue-500', trend: '+8%' },
    { label: 'Pengeluaran Bulan Ini', value: 'Rp 3.500.000', icon: TrendingDown, color: 'bg-red-500', trend: '-5%' },
    { label: 'Keuntungan Bersih', value: 'Rp 11.500.000', icon: CreditCard, color: 'bg-yellow-500', trend: '+15%' },
  ];

  const monthlyData = [
    { month: 'Jan', income: 12000000, expense: 2500000 },
    { month: 'Feb', income: 13500000, expense: 2800000 },
    { month: 'Mar', income: 15000000, expense: 3000000 },
    { month: 'Apr', income: 14500000, expense: 3200000 },
    { month: 'Mei', income: 16000000, expense: 3500000 },
    { month: 'Jun', income: 15000000, expense: 3000000 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Keuangan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${stat.color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-semibold ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Grafik Pendapatan & Pengeluaran</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                {monthlyData.map((data, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium text-gray-700">{data.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-green-200 rounded-full h-6 relative">
                          <div
                            className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(data.income / 20000000) * 100}%` }}
                          >
                            <span className="text-xs font-semibold text-white">
                              Rp {(data.income / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-red-200 rounded-full h-4 relative">
                          <div
                            className="bg-red-500 h-4 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(data.expense / 5000000) * 100}%` }}
                          >
                            <span className="text-xs font-semibold text-white">
                              Rp {(data.expense / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Pendapatan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Pengeluaran</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

