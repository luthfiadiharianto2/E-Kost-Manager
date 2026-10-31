import React, { useEffect } from 'react';
import { TenantLayout } from '../../components/TenantLayout';
import { User, Home, CheckCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TestimonialsRealtime from '../../components/TestimonialsRealtime';

export const TenantOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      AOS.init({ duration: 600, easing: 'ease-in-out', once: true });
    };
    initAOS();
  }, []);

  // Mock data
  const myKost = {
    name: 'Kost ABC',
    address: 'Jl. Merdeka No. 123, Jakarta',
    room: 'A-101',
    price: 1500000,
    facilities: ['AC', 'WiFi', 'Kamar Mandi Dalam', 'Dapur Bersama'],
    owner: 'Budi Santoso',
    phone: '081234567890',
  };

  const paymentHistory = [
    { id: 1, month: 'Januari 2024', amount: 1500000, status: 'paid', date: '2024-01-01', method: 'Transfer Bank' },
    { id: 2, month: 'Desember 2023', amount: 1500000, status: 'paid', date: '2023-12-01', method: 'Transfer Bank' },
    { id: 3, month: 'November 2023', amount: 1500000, status: 'paid', date: '2023-11-01', method: 'Transfer Bank' },
  ];

  const myComplaints = [
    { id: 1, title: 'AC Tidak Dingin', description: 'AC di kamar tidak dingin sejak kemarin', status: 'pending', priority: 'high', date: '2024-01-10' },
    { id: 2, title: 'WiFi Lambat', description: 'Koneksi WiFi sangat lambat di malam hari', status: 'in_progress', priority: 'medium', date: '2024-01-08' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <span className="w-4 h-4">⏳</span>;
      case 'in_progress':
        return <span className="w-4 h-4">⏳</span>;
      default:
        return <span className="w-4 h-4">⏳</span>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TenantLayout>
      {/* Welcome Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm p-6" data-aos="fade-up">
          <div className="flex items-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Selamat Datang</h2>
              <p className="text-lg font-semibold text-gray-900">Budi</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Terima kasih sudah menjadi bagian dari mawar kos
          </p>
        </div>

        {/* Room Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-6" data-aos="fade-up" data-aos-delay="100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-navy-900 mb-1">Kamar Mawar</h3>
            <p className="text-4xl font-bold text-navy-900">No. 1</p>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div>
              <p className="text-sm font-medium text-navy-900">Jatuh tempo: 1 Nov 2025</p>
            </div>
            <Home className="w-8 h-8 text-navy-900" />
          </div>
        </div>
      </div>

      {/* My Kost Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8" data-aos="fade-up">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Informasi Kost Saya</h2>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            <Eye className="w-4 h-4 inline mr-1" />
            Lihat Detail
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{myKost.name}</h3>
            <p className="text-gray-600 mb-2">{myKost.address}</p>
            <p className="text-sm text-gray-500">Kamar: {myKost.room}</p>
            <p className="text-sm text-gray-500">Pemilik: {myKost.owner}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Sewa Bulanan:</span>
              <span className="text-lg font-semibold text-gray-900">Rp {myKost.price.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Fasilitas:</span>
              <span className="text-sm text-gray-900">{myKost.facilities.length} item</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Kontak Pemilik:</span>
              <span className="text-sm text-primary-600">{myKost.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8" data-aos="fade-up">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Pembayaran</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h4 className="font-medium text-green-900">Pembayaran Terbaru Lunas</h4>
              <p className="text-sm text-green-700">Pembayaran untuk Januari 2024 telah diterima</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8" data-aos="fade-up" data-aos-delay="200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Riwayat Pembayaran Terbaru</h3>
          <button 
            onClick={() => navigate('/tenant/payments')} 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Lihat Semua
          </button>
        </div>
        <div className="space-y-3">
          {paymentHistory.slice(0, 3).map((payment) => (
            <div key={payment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{payment.month}</p>
                <p className="text-sm text-gray-500">{payment.method}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">Rp {payment.amount.toLocaleString('id-ID')}</p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                  {getStatusIcon(payment.status)}
                  <span className="ml-1">{payment.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8" data-aos="fade-up" data-aos-delay="400">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pengaduan Terbaru</h3>
          <button 
            onClick={() => navigate('/tenant/complaints')} 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Lihat Semua
          </button>
        </div>
        <div className="space-y-3">
          {myComplaints.slice(0, 2).map((complaint) => (
            <div key={complaint.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
              <p className="text-xs text-gray-500">{complaint.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white rounded-xl shadow-sm p-6" data-aos="fade-up" data-aos-delay="600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Dari Pengguna</h3>
          <p className="text-sm text-gray-500">Update realtime ketika backend tersedia</p>
        </div>
        <TestimonialsRealtime />
      </div>
    </TenantLayout>
  );
};

