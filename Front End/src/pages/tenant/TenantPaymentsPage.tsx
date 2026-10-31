import React, { useState, useEffect } from 'react';
import { TenantLayout } from '../../components/TenantLayout';
import { Plus, Printer, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const TenantPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [qrisString, setQrisString] = useState<string>('');
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

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

  // Mock data
  const payments = [
    { id: 1, noFaktur: 'M1-001-123', periode: '1 Sept-30 Sept 2025', tanggalTempo: '30 Sept 2025', status: 'Lunas', jumlah: 'Rp.650.000,00', amount: 650000 },
    { id: 2, noFaktur: 'M1-001-124', periode: '1 Okt-30 Okt 2025', tanggalTempo: '30 Okt 2025', status: 'Belum', jumlah: 'Rp.650.000,00', amount: 650000 },
  ];

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
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else if (statusResponse.status === 'expired' || statusResponse.status === 'failed') {
          clearInterval(pollInterval);
          setPollingInterval(null);
          toast.error('Pembayaran gagal atau expired');
        }
        
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setPollingInterval(null);
          toast.error('Waktu pembayaran habis, silakan coba lagi');
        }
      } catch (error) {
        if (pollCount % 12 === 0) {
          console.log('Polling payment status...', error);
        }
      }
    }, 5000); // Check setiap 5 detik
    
    return pollInterval;
  };

  // Handle Bayar - Tampilkan Modal QRIS
  const handleBayar = async (payment: any) => {
    setSelectedPayment(payment);
    setIsLoadingPayment(true);
    
    try {
      const amount = parseInt(payment.jumlah?.replace(/[^0-9]/g, '') || payment.amount?.toString() || '650000');
      const invoiceId = payment.noFaktur || payment.id || `M1-001-${Date.now()}`;
      
      const qrisResponse = await paymentService.createQRISPayment({
        invoice_id: invoiceId,
        amount: amount,
        description: `Pembayaran sewa kost - ${payment.periode || 'Periode bulanan'}`,
      });
      
      setQrisString(qrisResponse.qris_string);
      setShowQrisModal(true);
      
      const intervalId = startPaymentPolling(invoiceId);
      setPollingInterval(intervalId);
      
      toast.success('QRIS berhasil dibuat');
    } catch (error: any) {
      console.error('Error creating QRIS:', error);
      
      const fallbackQRIS = `indonesiaqris://payment?amount=${payment.amount || 650000}&merchantId=MAWAR_KOST&invoice=${payment.noFaktur || 'M1-001-124'}`;
      setQrisString(fallbackQRIS);
      setShowQrisModal(true);
      
      toast.error(error.response?.data?.message || 'Gagal membuat QRIS, menggunakan mode offline');
    } finally {
      setIsLoadingPayment(false);
    }
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
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; background: white; }
            .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .header p { margin-top: 5px; font-size: 14px; }
            .info { margin: 12px 0; padding: 8px 0; border-bottom: 1px dotted #ccc; }
            .info-label { font-weight: bold; display: inline-block; width: 160px; }
            .info-value { display: inline-block; }
            .total { border-top: 3px double #333; padding-top: 15px; margin-top: 25px; text-align: right; }
            .total-amount { font-size: 20px; font-weight: bold; margin-top: 5px; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 15px; }
            @media print { body { margin: 0; padding: 15px; } }
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
            <span class="info-label">Periode Sewa:</span>
            <span class="info-value">${payment.periode || '1 Sept-30 Sept 2025'}</span>
          </div>
          <div class="info">
            <span class="info-label">Tanggal Jatuh Tempo:</span>
            <span class="info-value">${payment.tanggalTempo || '30 Sept 2025'}</span>
          </div>
          <div class="info">
            <span class="info-label">Status:</span>
            <span class="info-value">${payment.status === 'Lunas' ? 'LUNAS' : 'BELUM LUNAS'}</span>
          </div>
          <div class="total">
            <div style="font-size: 14px; margin-bottom: 5px;">TOTAL PEMBAYARAN</div>
            <div class="total-amount">${payment.jumlah || 'Rp.650.000,00'}</div>
          </div>
          <div class="footer">
            <p>Terima kasih atas pembayaran Anda</p>
            <p>Struk ini adalah bukti pembayaran yang sah</p>
            <p style="margin-top: 10px;">Dicetak pada: ${new Date().toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(strukContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    };
    
    toast.success('Struk sedang dipersiapkan untuk dicetak...');
  };

  return (
    <TenantLayout>
      <div className="bg-white rounded-xl shadow-sm p-8">
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
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-sm text-gray-900">{payment.noFaktur}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{payment.periode}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{payment.tanggalTempo}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'Lunas' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{payment.jumlah}</td>
                  <td className="py-3 px-4">
                    {payment.status === 'Lunas' ? (
                      <button 
                        onClick={() => handleCetak(payment)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        Cetak
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBayar(payment)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <QrCode className="w-3 h-3" />
                        Bayar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </TenantLayout>
  );
};

