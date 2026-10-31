import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { ArrowLeft } from 'lucide-react';

export const AuthLoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize AOS
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
      });
    };
    initAOS();
  }, []);

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header */}
      <header className="bg-navy-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 text-base text-white/80 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Beranda
          </button>
        </div>
      </header>

      {/* Auth Section */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <LoginForm onSwitchToSignup={() => navigate('/auth/signup')} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-800 border-t border-white/10 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60">© 2025 E-Kost Manager. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
};
