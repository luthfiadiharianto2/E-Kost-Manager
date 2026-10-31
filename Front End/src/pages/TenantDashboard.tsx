import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Home,
  CreditCard,
  AlertTriangle,
  User,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Eye,
  MessageSquare,
  X,
  Printer,
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import TestimonialsRealtime from '../components/TestimonialsRealtime';
import Sidebar from '../components/Sidebar';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';

export const TenantDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [qrisString, setQrisString] = useState<string>('');
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
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

  // Cleanup polling saat modal ditutup atau komponen unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Stop polling saat modal ditutup
  useEffect(() => {
    if (!showQrisModal && pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [showQrisModal, pollingInterval]);

  // Mock data - replace with actual API calls
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
    { id: 3, title: 'Kebocoran Air', description: 'Ada kebocoran air di kamar mandi', status: 'resolved', priority: 'high', date: '2024-01-05' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <XCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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

  // Handle Bayar - Tampilkan Modal QRIS
  const handleBayar = async (payment: any) => {
    setSelectedPayment(payment);
    setIsLoadingPayment(true);
    
    try {
      // Ambil amount dari payment
      const amount = parseInt(payment.jumlah?.replace(/[^0-9]/g, '') || payment.amount?.toString() || '650000');
      const invoiceId = payment.noFaktur || payment.id || `M1-001-${Date.now()}`;
      
      // Generate QRIS dari backend
      const qrisResponse = await paymentService.createQRISPayment({
        invoice_id: invoiceId,
        amount: amount,
        description: `Pembayaran sewa kost - ${payment.periode || 'Periode bulanan'}`,
      });
      
      // Set QRIS string dari response backend
      setQrisString(qrisResponse.qris_string);
      setShowQrisModal(true);
      
      // Start polling untuk check payment status
      const intervalId = startPaymentPolling(invoiceId);
      setPollingInterval(intervalId);
      
      toast.success('QRIS berhasil dibuat');
    } catch (error: any) {
      console.error('Error creating QRIS:', error);
      
      // Fallback: gunakan QRIS code lokal jika backend error
      const fallbackQRIS = generateQRISCode(payment);
      setQrisString(fallbackQRIS);
      setShowQrisModal(true);
      
      toast.error(error.response?.data?.message || 'Gagal membuat QRIS, menggunakan mode offline');
    } finally {
      setIsLoadingPayment(false);
    }
  };

  // Polling untuk check payment status
  const startPaymentPolling = (invoiceId: string): number => {
    let pollCount = 0;
    const maxPolls = 60; // Poll selama 5 menit (60 x 5 detik)
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      
      try {
        const statusResponse = await paymentService.checkPaymentStatus(invoiceId);
        
        if (statusResponse.status === 'paid') {
          clearInterval(pollInterval);
          setPollingInterval(null);
          toast.success('Pembayaran berhasil!');
          setShowQrisModal(false);
          // Refresh payment list atau redirect
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else if (statusResponse.status === 'expired' || statusResponse.status === 'failed') {
          clearInterval(pollInterval);
          setPollingInterval(null);
          toast.error('Pembayaran gagal atau expired');
        }
        
        // Stop polling setelah max polls
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setPollingInterval(null);
          toast.error('Waktu pembayaran habis, silakan coba lagi');
        }
      } catch (error) {
        // Ignore error saat polling, mungkin backend belum siap
        // Tidak perlu menampilkan error ke user
        if (pollCount % 12 === 0) { // Log setiap 1 menit
          console.log('Polling payment status...', error);
        }
      }
    }, 5000); // Check setiap 5 detik
    
    return pollInterval;
  };

  // Handle Cetak - Print Struk
  const handleCetak = (payment: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Mohon izinkan pop-up untuk mencetak struk');
      return;
    }

    const strukContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pembayaran - ${payment.noFaktur || payment.id}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px double #333;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin-top: 5px;
              font-size: 14px;
            }
            .info {
              margin: 12px 0;
              padding: 8px 0;
              border-bottom: 1px dotted #ccc;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              width: 160px;
            }
            .info-value {
              display: inline-block;
            }
            .total {
              border-top: 3px double #333;
              padding-top: 15px;
              margin-top: 25px;
              text-align: right;
            }
            .total-amount {
              font-size: 20px;
              font-weight: bold;
              margin-top: 5px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 15px;
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>E-KOST MANAGER</h1>
            <p>STRUK PEMBAYARAN</p>
          </div>
          
          <div class="info">
            <span class="info-label">No Faktur:</span>
            <span class="info-value">${payment.noFaktur || payment.id || 'M1-001-123'}</span>
          </div>
          
          <div class="info">
            <span class="info-label">Nama Penyewa:</span>
            <span class="info-value">${user?.name || 'Budi'}</span>
          </div>
          
          <div class="info">
            <span class="info-label">Periode Sewa:</span>
            <span class="info-value">${payment.periode || '1 Sept-30 Sept 2025'}</span>
          </div>
          
          <div class="info">
            <span class="info-label">Tanggal Jatuh Tempo:</span>
            <span class="info-value">${payment.tanggalTempo || '30 Sept 2025'}</span>
          </div>
          
          <div class="info">
            <span class="info-label">Status:</span>
            <span class="info-value">${payment.status === 'paid' || payment.status === 'Lunas' ? 'LUNAS' : 'BELUM LUNAS'}</span>
          </div>
          
          <div class="total">
            <div style="font-size: 14px; margin-bottom: 5px;">TOTAL PEMBAYARAN</div>
            <div class="total-amount">${payment.jumlah || 'Rp.650.000,00'}</div>
          </div>
          
          <div class="footer">
            <p>Terima kasih atas pembayaran Anda</p>
            <p>Struk ini adalah bukti pembayaran yang sah</p>
            <p style="margin-top: 10px;">Dicetak pada: ${new Date().toLocaleString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(strukContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Optionally close after print
        // printWindow.close();
      }, 250);
    };
    
    toast.success('Struk sedang dipersiapkan untuk dicetak...');
  };

  // Generate QRIS Code (placeholder - bisa diganti dengan QR code generator library)
  const generateQRISCode = (payment: any) => {
    // Format QRIS: indonesiaqris://payment?amount=650000&merchantId=MAWAR_KOST&invoice=M1-001-124
    const amount = parseInt(payment.jumlah?.replace(/[^0-9]/g, '') || '650000');
    const invoice = payment.noFaktur || payment.id || 'M1-001-124';
    return `indonesiaqris://payment?amount=${amount}&merchantId=MAWAR_KOST&invoice=${invoice}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      <div className="flex-1 md:ml-56">
        {/* Header */}
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
          {/* Welcome Section */}
          {activeTab === 'overview' && (
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
          )}

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

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', name: 'Overview' },
                  { id: 'payments', name: 'Pembayaran' },
                  { id: 'complaints', name: 'Pengaduan' },
                  { id: 'profile', name: 'Profil' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Payment Status */}
                  <div data-aos="fade-up">
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
                  <div data-aos="fade-up" data-aos-delay="200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Riwayat Pembayaran Terbaru</h3>
                      <button onClick={() => setActiveTab('payments')} className="text-primary-600 hover:text-primary-700 text-sm font-medium">Lihat Semua</button>
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
                  <div data-aos="fade-up" data-aos-delay="400">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Pengaduan Terbaru</h3>
                      <button onClick={() => setActiveTab('complaints')} className="text-primary-600 hover:text-primary-700 text-sm font-medium">Lihat Semua</button>
                    </div>
                    <div className="space-y-3">
                      {myComplaints.slice(0, 2).map((complaint) => (
                        <div key={complaint.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                            <div className="flex space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                          <p className="text-xs text-gray-500">{complaint.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Testimonials (realtime-ready) */}
                  <div data-aos="fade-up" data-aos-delay="600">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Dari Pengguna</h3>
                      <p className="text-sm text-gray-500">Update realtime ketika backend tersedia</p>
                    </div>
                    <TestimonialsRealtime />
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div data-aos="fade-up">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Pembayaran</h2>
                    <button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Bayar Sekarang
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">No Faktur</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Periode Sewa</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Tanggal Jatuh Tempo</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Jumlah</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-3 px-4 text-sm text-gray-900">M1-001-123</td>
                          <td className="py-3 px-4 text-sm text-gray-700">1 Sept-30 Sept 2025</td>
                          <td className="py-3 px-4 text-sm text-gray-700">30 Sept 2025</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Lunas
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">Rp.650.000,00</td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleCetak({
                                noFaktur: 'M1-001-123',
                                periode: '1 Sept-30 Sept 2025',
                                tanggalTempo: '30 Sept 2025',
                                status: 'Lunas',
                                jumlah: 'Rp.650.000,00',
                                amount: 650000
                              })}
                              className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" />
                              Cetak
                            </button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-3 px-4 text-sm text-gray-900">M1-001-124</td>
                          <td className="py-3 px-4 text-sm text-gray-700">1 Okt-30 Okt 2025</td>
                          <td className="py-3 px-4 text-sm text-gray-700">30 Okt 2025</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Belum
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">Rp.650.000,00</td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleBayar({
                                noFaktur: 'M1-001-124',
                                periode: '1 Okt-30 Okt 2025',
                                tanggalTempo: '30 Okt 2025',
                                status: 'Belum',
                                jumlah: 'Rp.650.000,00',
                                amount: 650000
                              })}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <QrCode className="w-3 h-3" />
                              Bayar
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'complaints' && (
                <div data-aos="fade-up">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Aduan</h2>
                    <button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Tulis Aduan
                    </button>
                  </div>
                  
                  {/* Add Complaint Form */}
                  <div className="mb-8 bg-gray-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Penyewa 1</label>
                        <textarea 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                          rows={3}
                          placeholder="(isi aduan)"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-6 py-2 rounded-lg font-semibold transition-colors">
                          Kirim Aduan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Complaint List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Aduan anda</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900">Penyewa 1</p>
                      <p className="text-sm text-gray-600 mt-2">(isi aduan)</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div data-aos="fade-up">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profil</h2>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                      <input type="text" value="Budi" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input type="text" value="BudiMawar1" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value="BudiPeksa1234@gmail.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
                      <input type="tel" value="+62 812 345 6789" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" readOnly />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                      <input type="text" value="Jl. Pondok Gede Desa Sawit Kecamatan Sawit Timur Kabupaten Ngasal, Jawa. 56789" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input type="password" value="budbud1234" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" readOnly />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QRIS Payment Modal */}
      {showQrisModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pembayaran QRIS</h2>
              <button
                onClick={() => {
                  if (pollingInterval) {
                    clearInterval(pollingInterval);
                    setPollingInterval(null);
                  }
                  setShowQrisModal(false);
                  setQrisString('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block mb-4">
                {/* QR Code menggunakan qrcode.react */}
                <div className="flex flex-col items-center">
                  {isLoadingPayment ? (
                    <div className="w-64 h-64 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Membuat QRIS...</p>
                      </div>
                    </div>
                  ) : qrisString ? (
                    <>
                      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                        <QRCodeSVG
                          value={qrisString}
                          size={256}
                          level="H"
                          includeMargin={true}
                          fgColor="#000000"
                          bgColor="#FFFFFF"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Scan QR Code dengan</p>
                      <p className="text-sm font-semibold text-gray-700 mb-3">Aplikasi E-Wallet</p>
                      <div className="text-xs text-gray-400 break-all p-2 bg-gray-50 rounded max-w-xs">
                        {qrisString}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Gagal memuat QRIS</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-600">No Faktur: <span className="font-semibold text-gray-900">{selectedPayment.noFaktur}</span></p>
                <p className="text-lg font-bold text-gray-900">{selectedPayment.jumlah}</p>
                <p className="text-sm text-gray-500">Periode: {selectedPayment.periode}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Instruksi:</strong> Buka aplikasi e-wallet Anda (GoPay, OVO, DANA, dll), pilih QRIS, lalu scan kode di atas.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toast.success('Pembayaran sedang diproses...');
                    setShowQrisModal(false);
                  }}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Konfirmasi Pembayaran
                </button>
                <button
                  onClick={() => {
                    if (pollingInterval) {
                      clearInterval(pollingInterval);
                      setPollingInterval(null);
                    }
                    setShowQrisModal(false);
                    setQrisString('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};