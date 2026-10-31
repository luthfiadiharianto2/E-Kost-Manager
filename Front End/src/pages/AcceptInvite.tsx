import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { invitationService } from '../services/invitationService';

export const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token undangan tidak ditemukan');
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await invitationService.validateToken(token);
      
      if (response.success) {
        setInvitation(response.data);
      } else {
        setError(response.message || 'Undangan tidak valid');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Undangan tidak valid atau sudah kedaluwarsa');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');

    // Validations
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setSubmitting(true);

    try {
      await invitationService.acceptInvitation({
        token,
        password,
        password_confirmation: confirmPassword,
      });

      toast.success('Akun berhasil dibuat! Silakan login.');
      
      // Redirect ke halaman login
      setTimeout(() => {
        navigate('/auth/login', { state: { email: invitation?.invitation?.email } });
      }, 1500);

    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      setError(err.response?.data?.message || 'Gagal membuat akun. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memvalidasi undangan...</p>
        </div>
      </div>
    );
  }

  if (!invitation || error) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Undangan Tidak Valid</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Token undangan tidak ditemukan atau sudah kedaluwarsa.'}
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Kembali ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Terima Undangan</h2>
          <p className="text-gray-600">
            Anda diundang oleh <strong>{invitation.owner_name}</strong> untuk bergabung di{' '}
            <strong>{invitation.kost_name}</strong>
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Email:</strong> {invitation.invitation.email}
          </p>
          {invitation.invitation.name && (
            <p className="text-sm text-blue-800 mt-1">
              <strong>Nama:</strong> {invitation.invitation.name}
            </p>
          )}
        </div>

        {/* Password Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="Masukkan password yang sama"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              'Selesaikan Pendaftaran'
            )}
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-6">
          Dengan melanjutkan, Anda menyetujui syarat dan ketentuan yang berlaku
        </p>
      </div>
    </div>
  );
};

export default AcceptInvitePage;