import React, { useState } from 'react';
import { X, Mail, User, Send, CheckCircle, Link2, Share2, Copy } from 'lucide-react';
import { invitationService, InvitationResponse } from '../services/invitationService';
import toast from 'react-hot-toast';

interface InviteTenantProps {
  ownerId?: string | number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteTenant: React.FC<InviteTenantProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [invitationLink, setInvitationLink] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [emailConfigured, setEmailConfigured] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Pesan siap kirim untuk WhatsApp/chat bila email otomatis belum aktif
  const shareText = () =>
    `Halo${name ? ` ${name}` : ''}, Anda diundang bergabung sebagai penyewa di E-Kost Manager.\n\n` +
    `1. Buka link ini dan buat password (berlaku 7 hari):\n${invitationLink}\n\n` +
    `2. Setelah itu masuk di ${window.location.origin}/auth/login dengan email ${email} dan password tadi.`;

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

      const sent = !!response.data.email_sent;
      setInvitationLink(response.data.accept_url);
      setEmailSent(sent);
      setEmailConfigured(!!response.data.email_configured);
      setShowSuccess(true);
      if (sent) toast.success('Undangan berhasil dikirim!');
      else toast('Undangan dibuat. Kirim link ke penyewa lewat WhatsApp/chat.', { icon: '🔗' });
      
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

  const handleCopyMessage = (): void => {
    navigator.clipboard.writeText(shareText());
    toast.success('Pesan undangan disalin!');
  };

  const handleClose = (): void => {
    setEmail('');
    setName('');
    setShowSuccess(false);
    setInvitationLink('');
    setEmailSent(false);
    setEmailConfigured(false);
    setError('');
    onClose();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${emailSent ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {emailSent ? <CheckCircle className="w-10 h-10 text-green-600" /> : <Link2 className="w-9 h-9 text-yellow-600" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {emailSent ? 'Undangan Berhasil Dikirim!' : 'Undangan Dibuat'}
            </h2>
            {emailSent ? (
              <p className="text-sm text-gray-600 mb-6">
                Email undangan telah dikirim ke <strong>{email}</strong>. Minta penyewa memeriksa folder Spam/Promosi bila belum masuk.
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-6">
                {emailConfigured ? 'Email undangan gagal dikirim' : 'Email otomatis belum aktif, jadi undangan belum terkirim'} ke{' '}
                <strong>{email}</strong>. Kirim link di bawah ke penyewa lewat WhatsApp atau chat.
              </p>
            )}

            {!emailSent && (
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Kirim lewat WhatsApp
                </a>
                <button
                  onClick={handleCopyMessage}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Salin pesan
                </button>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Link Undangan
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
                Berlaku 7 hari dan hanya bisa dipakai sekali.
              </p>
            </div>

            <p className="text-xs text-gray-500 mb-6 text-left">
              Penyewa belum punya akun sampai membuka link ini dan membuat password. Setelah itu penyewa masuk
              di halaman Login dengan email <strong>{email}</strong> dan password tersebut.
            </p>

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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