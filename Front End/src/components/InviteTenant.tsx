import React, { useState } from 'react';
import { X, Mail, User, Send, CheckCircle } from 'lucide-react';
import { invitationService, InvitationResponse } from '../services/invitationService';
import toast from 'react-hot-toast';

interface InviteTenantProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteTenant: React.FC<InviteTenantProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [invitationLink, setInvitationLink] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (): Promise<void> => {
    setError('');
    
    if (!email) {
      setError('Email wajib diisi');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      return;
    }

    setLoading(true);

    try {
      const response: InvitationResponse = await invitationService.createInvitation({
        email,
        name: name || undefined,
      });

      setInvitationLink(response.data.accept_url);
      setShowSuccess(true);
      toast.success('Undangan berhasil dikirim!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error creating invitation:', err);
      const errorMsg = err.response?.data?.message || 'Gagal mengirim undangan. Silakan coba lagi.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (): void => {
    navigator.clipboard.writeText(invitationLink);
    toast.success('Link berhasil disalin!');
  };

  const handleClose = (): void => {
    setEmail('');
    setName('');
    setShowSuccess(false);
    setInvitationLink('');
    setError('');
    onClose();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Undangan Berhasil Dikirim!
            </h2>
            <p className="text-gray-600 mb-6">
              Email undangan telah dikirim ke <strong>{email}</strong>
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Link Undangan (Untuk Development)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={invitationLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-navy-900 rounded font-medium text-sm transition-colors"
                >
                  Salin
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Link ini dapat dibagikan manual jika diperlukan
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-navy-900 rounded-lg font-semibold transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Undang Penyewa</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Penyewa (Opsional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama penyewa"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Nama akan digunakan dalam email undangan
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Penyewa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="contoh@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Email harus valid dan belum terdaftar
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Penyewa akan menerima email berisi link undangan. 
              Link berlaku selama 7 hari dan hanya bisa digunakan sekali.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-navy-900 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Kirim Undangan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteTenant;