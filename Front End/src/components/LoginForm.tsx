import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Lock, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginFormData } from '../types';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      // 1. Log Attempt (Logging)
      console.log('Login Attempt:', {
        email: data.email,
        timestamp: new Date().toISOString(),
      });

      setLoginStatus({ type: null, message: '' });
      
      // 2. Call non-refresh login service (Auth Logic)
      const loggedInUser = await login(data.email, data.password);
      
      // 3. Log Success (Logging)
      console.log('Login Success:', {
        email: data.email,
        role: loggedInUser.role,
        timestamp: new Date().toISOString(),
      });

      // 4. Show Success Message (UX Feedback)
      setLoginStatus({
        type: 'success',
        message: 'Login berhasil! Mengalihkan...',
      });

      // 5. Navigate (Non-refresh redirect)
      setTimeout(() => {
        if (loggedInUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/tenant');
        }
      }, 1000);

    } catch (error: any) {
      // 6. Log Error (Logging)
      const errorDetails = {
        // ... (Error details logging)
      };
      console.error('❌ Login Failed:', errorDetails);

      // 7. Show Error Message (UX Feedback)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login gagal. Silakan coba lagi.';
      
      setLoginStatus({
        type: 'error',
        message: errorMessage,
      });
      // TIDAK ADA RESET FORM: Data tetap ada untuk dicoba lagi
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" data-aos="fade-up">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
          <p className="text-gray-600">Masuk ke akun Anda</p>
        </div>

        {/* Status Message */}
        {loginStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              loginStatus.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {loginStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  loginStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {loginStatus.message}
              </p>
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Role akun Anda (Pemilik/Penyewa) akan ditentukan otomatis berdasarkan data di sistem.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { required: 'Email wajib diisi' })}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black"
                placeholder="Masukkan email Anda"
                disabled={isLoading}
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password wajib diisi' })}
                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black"
                placeholder="Masukkan password Anda"
                disabled={isLoading}
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-primary-600 hover:text-primary-700 font-medium"
              disabled={isLoading}
            >
              Daftar sebagai pemilik
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};