import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center" data-aos="fade-up">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Akses Ditolak
          </h1>
          <p className="text-gray-600 mb-6">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
};