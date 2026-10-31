import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, CreditCard, LogIn, Menu, X } from 'lucide-react';
import AOS from 'aos';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let resizeHandler: (() => void) | null = null;
    
    // Initialize AOS
    try {
      // Initialize AOS
      AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        once: false, // Allow animation to repeat on scroll back up
        offset: 50,
        delay: 0,
        disable: false,
        startEvent: 'DOMContentLoaded',
      });
      
      // Refresh AOS after DOM is ready
      setTimeout(() => {
        AOS.refresh();
      }, 100);
      
      // Refresh on window resize to handle responsive changes
      resizeHandler = () => {
        AOS.refresh();
      };
      window.addEventListener('resize', resizeHandler);
      
      // Also refresh after a longer delay to catch any late-rendered content
      setTimeout(() => {
        AOS.refresh();
      }, 500);
      
    } catch (error) {
      console.error('Error initializing AOS:', error);
    }
    
    // Cleanup
    return () => {
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-navy-900 text-white overflow-x-hidden">
      {/* Fixed Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-navy-900/100 border-b border-white/10" data-aos="fade-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/img/logo.png" alt="Logo" className="h-14 w-auto rounded-md" data-aos="zoom-in" data-aos-delay="100" />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-base text-white/80">
            <a className="hover:text-white transition-colors font-medium" href="#features">Beranda</a>
            <a className="hover:text-white transition-colors font-medium" href="#about">Tentang Kami</a>
            <a className="hover:text-white transition-colors font-medium" href="#contact">Hubungi Kami</a>
            <button onClick={() => navigate('/auth/login')} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-2.5 hover:bg-white/10 transition-colors text-base">
              <LogIn className="w-5 h-5" /> Log In
            </button>
            <button onClick={() => navigate('/auth/signup')} className="rounded-md bg-accent-500 text-navy-900 px-5 py-2.5 font-semibold hover:bg-accent-400 transition-colors text-base">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-md hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-navy-900/95 border-t border-white/10">
            <div className="px-4 py-5 space-y-5">
              <a className="block text-base text-white/80 hover:text-white transition-colors font-medium" href="#features">Beranda</a>
              <a className="block text-base text-white/80 hover:text-white transition-colors font-medium" href="#about">Tentang Kami</a>
              <a className="block text-base text-white/80 hover:text-white transition-colors font-medium" href="#contact">Hubungi Kami</a>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <button onClick={() => navigate('/auth/login')} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-4 py-3 hover:bg-white/10 transition-colors text-base">
                  <LogIn className="w-5 h-5" /> Log In
                </button>
                <button onClick={() => navigate('/auth/signup')} className="rounded-md bg-accent-500 text-navy-900 px-4 py-3 font-semibold hover:bg-accent-400 transition-colors text-base">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div data-aos="fade-right" data-aos-duration="1000">
              <p className="text-accent-400 font-semibold tracking-wide mb-3" data-aos="fade-up" data-aos-delay="100">Web Manajemen Kos & Properti</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4" data-aos="fade-up" data-aos-delay="200">
                Kelola Kos Anda Lebih Mudah dan Untung.
                <span className="block text-accent-400" data-aos="fade-up" data-aos-delay="300">Nikmati Kemudahan Digital!</span>
              </h1>
              <p className="text-white/80 mb-8 max-w-xl text-sm sm:text-base" data-aos="fade-up" data-aos-delay="400">
                Pantau penghuni, kelola keuangan, dan maksimalkan keuntungan, semua dalam satu genggaman.
              </p>
              <div className="flex flex-col sm:flex-row gap-3" data-aos="fade-up" data-aos-delay="500">
                <button onClick={() => navigate('/auth/login')} className="rounded-lg bg-accent-500 text-navy-900 px-5 py-3 font-semibold hover:bg-accent-400 transition-colors transform hover:scale-105">Mulai Sekarang</button>
                <a href="#features" className="rounded-lg border border-white/20 px-5 py-3 font-semibold hover:bg-white/10 transition-colors text-center transform hover:scale-105">Pelajari Fitur</a>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 aspect-video overflow-hidden" data-aos="fade-left" data-aos-delay="300">
              <img src="/img/kost-image.png" alt="Kost Image" className="w-full h-full object-cover" data-aos="zoom-in" data-aos-delay="500" />
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="bg-navy-900/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-white mb-4">Fitur Unggulan</h2>
            <p className="text-white/70">Solusi lengkap untuk manajemen kost modern</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105 hover:shadow-lg" data-aos="flip-left" data-aos-delay="100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-500/20 text-accent-400 mb-4" data-aos="zoom-in" data-aos-delay="200">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manajemen Kost</h3>
              <p className="text-white/70 text-sm sm:text-base">Kelola data kost, kamar, dan fasilitas dengan mudah melalui dashboard admin</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105 hover:shadow-lg" data-aos="flip-left" data-aos-delay="200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-500/20 text-accent-400 mb-4" data-aos="zoom-in" data-aos-delay="300">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Penyewa</h3>
              <p className="text-white/70 text-sm sm:text-base">Penyewa dapat melihat informasi kost, melakukan pembayaran, dan melaporkan masalah</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105 hover:shadow-lg sm:col-span-2 lg:col-span-1" data-aos="flip-left" data-aos-delay="300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-500/20 text-accent-400 mb-4" data-aos="zoom-in" data-aos-delay="400">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pembayaran Digital</h3>
              <p className="text-white/70 text-sm sm:text-base">Sistem pembayaran terintegrasi untuk memudahkan transaksi sewa kost</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="bg-white text-navy-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up" data-aos-duration="800">
            <h2 className="text-3xl font-bold text-navy-900 mb-4" data-aos="zoom-in" data-aos-delay="100">
              Tentang Kami
            </h2>
            <p className="text-gray-600" data-aos="fade-up" data-aos-delay="200">Platform manajemen kost terpercaya</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div data-aos="fade-right" data-aos-delay="100">
              <div className="space-y-6">
                <p className="text-gray-700 text-base leading-relaxed" data-aos="fade-up" data-aos-delay="200">
                  Kami adalah tim yang terdiri dari mahasiswa aktif di Telkom University Purwokerto yang bersemangat dalam teknologi dan manajemen properti, didirikan di Purwokerto pada tahun 2025. Kami menciptakan platform E Kost Manager sebagai jawaban atas kebutuhan mendesak akan sistem pengelolaan kos yang terintegrasi dan user-friendly.
                </p>
                
                <div data-aos="fade-up" data-aos-delay="300">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Misi Kami:</h3>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-semibold text-navy-900 mr-2">•</span>
                      <div>
                        <span className="font-semibold text-navy-900">Memberdayakan Pemilik Kos:</span> Menyediakan platform yang membuat pengelolaan properti menjadi efisien, menghemat waktu, dan meningkatkan profitabilitas.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-navy-900 mr-2">•</span>
                      <div>
                        <span className="font-semibold text-navy-900">Meningkatkan Pengalaman Penyewa:</span> Menciptakan proses sewa-menyewa yang transparan, mudah, dan nyaman secara digital.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-navy-900 mr-2">•</span>
                      <div>
                        <span className="font-semibold text-navy-900">Menjadi Jantung Digital Kos di Purwokerto:</span> Berkontribusi pada ekosistem properti lokal dengan solusi teknologi terdepan.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 aspect-video overflow-hidden" data-aos="fade-left" data-aos-delay="200">
              <img src="/img/about-us.jpg" alt="Kost Image" className="w-full h-full object-cover" data-aos="zoom-in" data-aos-delay="400" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-black mb-2">
              <span className="text-accent-400">Testimoni</span> Pengguna
            </h2>
            <p className="text-black/70">
              Kirim testimonimu <a href="#contact" className="text-blue-400 underline hover:text-blue-300">di sini</a>
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {[
              { name: "Budi", property: "Kos Mawar", text: "Pengalaman menggunakan E-Kost Manager sangat membantu! Fitur pembayaran digital dan pengaduan sangat praktis." },
              { name: "Suhartono", property: "Kos Mawar", text: "Platform yang sangat user-friendly. Mudah mengelola kost dan berkomunikasi dengan penyewa." },
              { name: "Ahmad", property: "Kos Mawar", text: "Sistem pembayaran terintegrasi sangat memudahkan transaksi bulanan. Highly recommended!" }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/5 border border-black/10 rounded-xl p-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center">
                    <span className="text-black/60 font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-black">{testimonial.name}</p>
                    <p className="text-black/60 text-sm">{testimonial.property}</p>
                  </div>
                </div>
                <p className="text-black/80 text-sm">{testimonial.text}</p>
              </div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: "Sarah", property: "Kos Mawar", text: "Interface yang clean dan mudah dipahami. Proses pembayaran jadi lebih cepat dan aman." },
              { name: "Rizki", property: "Kos Mawar", text: "Fitur pengaduan sangat membantu untuk komunikasi dengan pemilik kost. Responsif dan efisien." }
            ].map((testimonial, index) => (
              <div key={index + 3} className="bg-white/5 border border-black/10 rounded-xl p-6" data-aos="fade-up" data-aos-delay={(index + 3) * 100}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center">
                    <span className="text-black/60 font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-black">{testimonial.name}</p>
                    <p className="text-black/60 text-sm">{testimonial.property}</p>
                  </div>
                </div>
                <p className="text-black/80 text-sm">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-white text-navy-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4" data-aos="zoom-in" data-aos-delay="100">Hubungi Kami</h2>
            <p className="text-gray-600" data-aos="fade-up" data-aos-delay="200">Kami siap membantu Anda</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div data-aos="fade-right" data-aos-delay="100">
              <h3 className="text-2xl font-bold mb-4" data-aos="fade-up" data-aos-delay="200">Informasi Kontak</h3>
              <div className="space-y-4 text-gray-700">
                <p data-aos="fade-up" data-aos-delay="300"><strong>Email:</strong> support@ekostmanager.com</p>
                <p data-aos="fade-up" data-aos-delay="400"><strong>Telepon:</strong> +62 812 3456 7890</p>
                <p data-aos="fade-up" data-aos-delay="500"><strong>Alamat:</strong> Jakarta, Indonesia</p>
              </div>
              <div className="mt-6 h-40 rounded-xl bg-navy-900/5 border border-navy-900/10" data-aos="zoom-in" data-aos-delay="600" />
            </div>
            <div data-aos="fade-left" data-aos-delay="200">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div data-aos="fade-up" data-aos-delay="300">
                  <input 
                    className="w-full rounded-md border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all" 
                    placeholder="Nama" 
                    type="text"
                  />
                </div>
                <div data-aos="fade-up" data-aos-delay="400">
                  <input 
                    className="w-full rounded-md border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all" 
                    placeholder="Email" 
                    type="email" 
                  />
                </div>
                <div data-aos="fade-up" data-aos-delay="500">
                  <textarea 
                    className="w-full rounded-md border border-gray-300 px-4 py-3 h-32 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all" 
                    placeholder="Pesan" 
                  />
                </div>
                <div data-aos="fade-up" data-aos-delay="600">
                  <button className="w-full bg-accent-500 text-navy-900 px-5 py-3 font-semibold rounded-md hover:bg-accent-400 transition-all transform hover:scale-105">
                    Kirim
                  </button>
                </div>
              </form>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Untuk pemilik: daftar melalui tombol Sign Up. Untuk penyewa: minta undangan atau link dari pemilik Anda.
                </p>
                <p>
                  Jika Anda sudah menerima link undangan, buka <button onClick={() => navigate('/accept-invite')} className="text-primary-600 underline">halaman terima undangan</button> untuk menyelesaikan pendaftaran.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-navy-800 border-t border-white/10 text-white py-8" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 text-center">
          <p className="text-white/60" data-aos="fade-up" data-aos-delay="100">© 2025 E-Kost Manager. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
};