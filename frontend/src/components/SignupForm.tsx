import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Lock, Mail, Phone, Key, MapPin, Building2, CreditCard, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { SignupFormData } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { 
  regionService,
  Province,
  Regency,
  District,
  Village
} from '../services/regionService';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Region states
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedRegencyCode, setSelectedRegencyCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
  const [selectedVillageCode, setSelectedVillageCode] = useState<string>('');

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [availableRegencies, setAvailableRegencies] = useState<Regency[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableVillages, setAvailableVillages] = useState<Village[]>([]);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const data = await regionService.getProvinces();
        console.log('Loaded provinces in component:', data.length, 'provinces');
        if (data.length > 0) {
          console.log('First 3 provinces:', data.slice(0, 3));
        }
        setProvinces(data);
        if (data.length === 0) {
          toast.error('Data provinsi kosong. Menggunakan data fallback...');
          // Try to use fallback
          const { provincesFallback } = await import('../utils/provincesData');
          setProvinces(provincesFallback.map(p => ({ id: p.id, name: p.name })));
        } else {
          console.log('✅ Successfully loaded', data.length, 'provinces');
          toast.success(`Berhasil memuat ${data.length} provinsi`);
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
        console.warn('⚠️ Using fallback data for provinces');
        // Use fallback data if API fails
        try {
          const { provincesFallback } = await import('../utils/provincesData');
          const fallbackData = provincesFallback.map(p => ({ id: p.id, name: p.name }));
          setProvinces(fallbackData);
          toast(`Menggunakan data provinsi offline (${fallbackData.length} provinsi)`, { icon: '⚠️' });
          console.log('✅ Loaded fallback provinces:', fallbackData.length);
        } catch (fallbackError) {
          console.error('Failed to load fallback data:', fallbackError);
          toast.error('Gagal memuat data provinsi. Silakan refresh halaman.');
        }
      } finally {
        setLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    setValue,
  } = useForm<SignupFormData>();

  const password = watch('password');
  const email = watch('email');

  // Handle province change
  useEffect(() => {
    if (selectedProvinceCode) {
      const selectedProvince = provinces.find(p => p.id === selectedProvinceCode);
      setValue('provinsi', selectedProvince?.name || '');
      
      // Reset dependent fields
      setSelectedRegencyCode('');
      setSelectedDistrictCode('');
      setSelectedVillageCode('');
      setValue('kota', '');
      setValue('kecamatan', '');
      setValue('kelurahan', '');
      setAvailableRegencies([]);
      setAvailableDistricts([]);
      setAvailableVillages([]);

      // Fetch regencies
      const loadRegencies = async () => {
        try {
          setLoadingRegencies(true);
          const data = await regionService.getRegenciesByProvince(selectedProvinceCode);
          console.log('Loaded regencies:', data.length, 'regencies for province', selectedProvinceCode);
          
          if (data.length === 0) {
            throw new Error('Data kabupaten/kota tidak ditemukan');
          }
          
          setAvailableRegencies(data);
          toast.success(`Berhasil memuat ${data.length} kabupaten/kota`);
        } catch (error: any) {
          console.error('Error loading regencies:', error);
          setAvailableRegencies([]);
          toast.error(`Gagal memuat data kabupaten/kota: ${error.message}. Silakan refresh halaman atau coba lagi.`, {
            duration: 5000
          });
        } finally {
          setLoadingRegencies(false);
        }
      };
      loadRegencies();
    }
  }, [selectedProvinceCode, provinces, setValue]);

  // Handle regency change
  useEffect(() => {
    if (selectedRegencyCode && availableRegencies.length > 0) {
      const selectedRegency = availableRegencies.find(r => r.id === selectedRegencyCode);
      setValue('kota', selectedRegency?.name || '');
      
      // Reset dependent fields
      setSelectedDistrictCode('');
      setSelectedVillageCode('');
      setValue('kecamatan', '');
      setValue('kelurahan', '');
      setAvailableDistricts([]);
      setAvailableVillages([]);

      // Fetch districts
      const loadDistricts = async () => {
        try {
          setLoadingDistricts(true);
          const data = await regionService.getDistrictsByRegency(selectedRegencyCode);
          console.log('Loaded districts:', data.length, 'for regency', selectedRegencyCode);
          
          if (data.length === 0) {
            throw new Error('Data kecamatan tidak ditemukan');
          }
          
          setAvailableDistricts(data);
          toast.success(`Berhasil memuat ${data.length} kecamatan`);
        } catch (error: any) {
          console.error('Error loading districts:', error);
          setAvailableDistricts([]);
          toast.error(`Gagal memuat data kecamatan: ${error.message}. Silakan refresh halaman atau coba lagi.`, {
            duration: 5000
          });
        } finally {
          setLoadingDistricts(false);
        }
      };
      loadDistricts();
    }
  }, [selectedRegencyCode, availableRegencies, setValue]);

  // Handle district change
  useEffect(() => {
    if (selectedDistrictCode && availableDistricts.length > 0) {
      const selectedDistrict = availableDistricts.find(d => d.id === selectedDistrictCode);
      setValue('kecamatan', selectedDistrict?.name || '');
      
      // Reset dependent fields
      setSelectedVillageCode('');
      setValue('kelurahan', '');
      setAvailableVillages([]);

      // Fetch villages
      const loadVillages = async () => {
        try {
          setLoadingVillages(true);
          const data = await regionService.getVillagesByDistrict(selectedDistrictCode);
          console.log('Loaded villages:', data.length, 'for district', selectedDistrictCode);
          
          if (data.length === 0) {
            throw new Error('Data kelurahan/desa tidak ditemukan');
          }
          
          setAvailableVillages(data);
          toast.success(`Berhasil memuat ${data.length} kelurahan/desa`);
        } catch (error: any) {
          console.error('Error loading villages:', error);
          setAvailableVillages([]);
          toast.error(`Gagal memuat data kelurahan/desa: ${error.message}. Silakan refresh halaman atau coba lagi.`, {
            duration: 5000
          });
        } finally {
          setLoadingVillages(false);
        }
      };
      loadVillages();
    }
  }, [selectedDistrictCode, availableDistricts, setValue]);

  // Handle village change
  useEffect(() => {
    if (selectedVillageCode && availableVillages.length > 0) {
      const selectedVillage = availableVillages.find(v => v.id === selectedVillageCode);
      setValue('kelurahan', selectedVillage?.name || '');
    }
  }, [selectedVillageCode, availableVillages, setValue]);

  // Handle step 1 submission - move to step 2
  const onStep1Submit = async (data: SignupFormData) => {
    const isValid = await trigger(['namaKost', 'namaPemilik', 'email', 'password', 'confirmPassword']);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  // Handle step 2 submission - move to step 3 (OTP)
  const onStep2Submit = async (data: SignupFormData) => {
    // Validate dropdown selections
    if (!selectedProvinceCode) {
      toast.error('Silakan pilih Provinsi');
      return;
    }
    // Validate that all dropdowns are selected
    if (!selectedRegencyCode) {
      toast.error('Silakan pilih Kota/Kabupaten dari dropdown');
      return;
    }
    if (!selectedDistrictCode) {
      toast.error('Silakan pilih Kecamatan dari dropdown');
      return;
    }
    if (!selectedVillageCode) {
      toast.error('Silakan pilih Kelurahan/Desa dari dropdown');
      return;
    }

    const isValid = await trigger(['whatsapp', 'alamat', 'kodePos', 'provinsi', 'kota', 'kecamatan', 'kelurahan', 'pilihanPembayaran']);
    if (isValid) {
      try {
        setIsLoading(true);
        const otpResponse = await authService.requestOTP(email);
        if (otpResponse?.otp) {
          toast.success(`Kode OTP telah dikirim dan ditampilkan: ${otpResponse.otp}`);
          (otpResponse.otp) && setValue('otp', otpResponse.otp);
        } else {
          toast.success('Kode OTP telah dikirim ke email Anda');
        }
        setOtpSent(true);
        setCurrentStep(3);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal mengirim kode OTP');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle final submission with OTP verification
  // Handle final submission with OTP verification
  const onFinalSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      
      // Verify OTP first
      const otpValid = await trigger('otp');
      if (!otpValid) {
        setIsLoading(false);
        return;
      }

      // Get all form data
      const allFormData = watch();


      // Pastikan OTP ada
      if (!data.otp || data.otp.trim() === '') {
        toast.error('Kode OTP wajib diisi');
        setIsLoading(false);
        return;
      }

      // Prepare signup data - pastikan semua field ada
      const signupData: SignupFormData = {
        email: allFormData.email,
        password: allFormData.password,
        confirmPassword: allFormData.confirmPassword,
        // Map ke field yang expected
        namaPemilik: allFormData.namaPemilik,
        namaKost: allFormData.namaKost,
        whatsapp: allFormData.whatsapp,
        alamat: allFormData.alamat,
        kodePos: allFormData.kodePos,
        provinsi: allFormData.provinsi,
        kota: allFormData.kota,
        kecamatan: allFormData.kecamatan,
        kelurahan: allFormData.kelurahan,
        pilihanPembayaran: allFormData.pilihanPembayaran,
        otp: data.otp.trim(), // Pastikan OTP di-trim
      };

      await authService.signup(signupData);
      
      toast.success('Pendaftaran berhasil! Silakan login.');
      onSwitchToLogin();
    } catch (error: any) {
      console.error('❌ Signup error:', error.response?.data);
      
      // Better error handling
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        
        // Display all errors
        Object.entries(errors).forEach(([field, messages]) => {
          const msgArray = messages as string[];
          msgArray.forEach(msg => toast.error(`${field}: ${msg}`));
        });
      } else {
        toast.error(error.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      handleSubmit(onStep1Submit)();
    } else if (currentStep === 2) {
      handleSubmit(onStep2Submit)();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" data-aos="fade-up">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Daftar Pemilik Kost</h2>
          <p className="text-gray-600 text-sm">
            {currentStep === 1 && 'Mohon isi informasi dasar akun Anda'}
            {currentStep === 2 && 'Mohon isi informasi pemilik properti'}
            {currentStep === 3 && 'Masukkan kode OTP untuk verifikasi'}
          </p>
          {/* Progress indicator */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 w-12 rounded-full transition-all ${
                  step <= currentStep ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(currentStep === 3 ? onFinalSubmit : onStep1Submit)} className="space-y-6">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kost <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('namaKost', { required: 'Nama kost wajib diisi' })}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white"
                    placeholder="Masukkan nama kost"
                  />
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.namaKost && (
                  <p className="mt-1 text-sm text-red-600">{errors.namaKost.message}</p>
                )}
              </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pemilik <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                    {...register('namaPemilik', { required: 'Nama pemilik wajib diisi' })}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white"
                    placeholder="Masukkan nama pemilik"
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
                {errors.namaPemilik && (
                  <p className="mt-1 text-sm text-red-600">{errors.namaPemilik.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { 
                  required: 'Email wajib diisi',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Format email tidak valid'
                  }
                })}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white"
                placeholder="Masukkan email Anda"
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { 
                  required: 'Password wajib diisi',
                  minLength: {
                    value: 6,
                    message: 'Password minimal 6 karakter'
                  }
                })}
                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white"
                placeholder="Masukkan password"
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', { 
                  required: 'Konfirmasi password wajib diisi',
                  validate: value => value === password || 'Password tidak cocok'
                })}
                    className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white"
                placeholder="Konfirmasi password"
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
            </>
          )}

          {/* STEP 2: Owner Information */}
          {currentStep === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No WhatsApp
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    {...register('whatsapp', { 
                      required: 'Nomor WhatsApp wajib diisi',
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'Format nomor WhatsApp tidak valid'
                      }
                    })}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white"
                    placeholder="Masukkan nomor WhatsApp"
                  />
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.whatsapp && (
                  <p className="mt-1 text-sm text-red-600">{errors.whatsapp.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('alamat', { required: 'Alamat wajib diisi' })}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white"
                    placeholder="Masukkan alamat lengkap (jalan, nomor rumah, dll)"
                  />
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.alamat && (
                  <p className="mt-1 text-sm text-red-600">{errors.alamat.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Pos <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('kodePos', { 
                      required: 'Kode pos wajib diisi',
                      pattern: {
                        value: /^[0-9]{5}$/,
                        message: 'Kode pos harus 5 digit angka'
                      }
                    })}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 bg-white"
                    placeholder="Masukkan kode pos"
                  />
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.kodePos && (
                  <p className="mt-1 text-sm text-red-600">{errors.kodePos.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedProvinceCode}
                    onChange={(e) => {
                      setSelectedProvinceCode(e.target.value);
                    }}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900"
                    required
                    disabled={loadingProvinces}
                  >
                    <option value="">
                      {loadingProvinces ? 'Memuat provinsi...' : 'Pilih Provinsi'}
                    </option>
                    {provinces.length > 0 ? (
                      provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.name}
                        </option>
                      ))
                    ) : (
                      !loadingProvinces && (
                        <option value="" disabled>
                          Tidak ada data provinsi tersedia
                        </option>
                      )
                    )}
                  </select>
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="hidden"
                    {...register('provinsi', { required: 'Provinsi wajib diisi' })}
                  />
                </div>
                {errors.provinsi && (
                  <p className="mt-1 text-sm text-red-600">{errors.provinsi.message}</p>
                )}
                {!selectedProvinceCode && errors.provinsi && (
                  <p className="mt-1 text-sm text-red-600">Provinsi wajib diisi</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kota/Kabupaten <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedRegencyCode}
                    onChange={(e) => {
                      setSelectedRegencyCode(e.target.value);
                    }}
                    disabled={!selectedProvinceCode || loadingRegencies}
                    className={`w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900 ${
                      !selectedProvinceCode || loadingRegencies ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
                    }`}
                    required
                  >
                    <option value="">
                      {loadingRegencies 
                        ? 'Memuat kabupaten/kota...' 
                        : selectedProvinceCode 
                        ? availableRegencies.length === 0
                          ? 'Menunggu data...'
                          : 'Pilih Kota/Kabupaten'
                        : 'Pilih Provinsi terlebih dahulu'}
                    </option>
                    {availableRegencies.map((regency) => (
                      <option key={regency.id} value={regency.id}>
                        {regency.name}
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  {/* Store selected value */}
                  <input
                    type="hidden"
                    {...register('kota', { 
                      required: !selectedRegencyCode ? 'Kota/Kabupaten wajib diisi' : false
                    })}
                  />
                </div>
                {errors.kota && (
                  <p className="mt-1 text-sm text-red-600">{errors.kota.message}</p>
                )}
                {!selectedRegencyCode && errors.kota && (
                  <p className="mt-1 text-sm text-red-600">Kota/Kabupaten wajib diisi</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrictCode}
                    onChange={(e) => {
                      setSelectedDistrictCode(e.target.value);
                    }}
                    disabled={!selectedRegencyCode || loadingDistricts}
                    className={`w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900 ${
                      !selectedRegencyCode || loadingDistricts ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
                    }`}
                    required
                  >
                    <option value="">
                      {loadingDistricts 
                        ? 'Memuat kecamatan...' 
                        : selectedRegencyCode 
                        ? availableDistricts.length === 0
                          ? 'Menunggu data...'
                          : 'Pilih Kecamatan'
                        : 'Pilih Kota/Kabupaten terlebih dahulu'}
                    </option>
                    {availableDistricts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  {/* Store selected value */}
                  <input
                    type="hidden"
                    {...register('kecamatan', { 
                      required: !selectedDistrictCode ? 'Kecamatan wajib diisi' : false
                    })}
                  />
                </div>
                {errors.kecamatan && (
                  <p className="mt-1 text-sm text-red-600">{errors.kecamatan.message}</p>
                )}
                {!selectedDistrictCode && errors.kecamatan && (
                  <p className="mt-1 text-sm text-red-600">Kecamatan wajib diisi</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelurahan/Desa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedVillageCode}
                    onChange={(e) => {
                      setSelectedVillageCode(e.target.value);
                    }}
                    disabled={!selectedDistrictCode || loadingVillages}
                    className={`w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900 ${
                      !selectedDistrictCode || loadingVillages ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
                    }`}
                    required
                  >
                    <option value="">
                      {loadingVillages 
                        ? 'Memuat kelurahan/desa...' 
                        : selectedDistrictCode 
                        ? availableVillages.length === 0
                          ? 'Menunggu data...'
                          : 'Pilih Kelurahan/Desa'
                        : 'Pilih Kecamatan terlebih dahulu'}
                    </option>
                    {availableVillages.map((village) => (
                      <option key={village.id} value={village.id}>
                        {village.name}
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  {/* Store selected value */}
                  <input
                    type="hidden"
                    {...register('kelurahan', { 
                      required: !selectedVillageCode ? 'Kelurahan/Desa wajib diisi' : false
                    })}
                  />
                </div>
                {errors.kelurahan && (
                  <p className="mt-1 text-sm text-red-600">{errors.kelurahan.message}</p>
                )}
                {!selectedVillageCode && errors.kelurahan && (
                  <p className="mt-1 text-sm text-red-600">Kelurahan/Desa wajib diisi</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilihan Pembayaran <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('pilihanPembayaran', { required: 'Pilihan pembayaran wajib diisi' })}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900"
                  >
                    <option value="">Pilih metode pembayaran</option>
                    <option value="bank_transfer">Transfer Bank</option>
                    <option value="e_wallet">E-Wallet (GoPay, OVO, Dana, dll)</option>
                    <option value="cash">Tunai</option>
                    <option value="qris">QRIS</option>
                  </select>
                  <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.pilihanPembayaran && (
                  <p className="mt-1 text-sm text-red-600">{errors.pilihanPembayaran.message}</p>
                )}
              </div>
            </>
          )}

          {/* STEP 3: OTP Verification */}
          {currentStep === 3 && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Key className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verifikasi Email</h3>
                <p className="text-gray-600 text-sm">
                  Kami telah mengirimkan kode OTP ke email <span className="font-semibold">{email}</span>
                  {otpSent && watch('otp') && (
                    <>
                      <br />
                      <span className="text-green-600 text-sm font-semibold">
                        (Lingkungan pengembangan: OTP saat ini {watch('otp')})
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode OTP <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('otp', { 
                      required: 'Kode OTP wajib diisi',
                      pattern: {
                        // Panjang OTP Supabase dapat diatur 6-8 digit di dashboard Auth
                        value: /^[0-9]{6,8}$/,
                        message: 'Kode OTP harus 6-8 digit angka'
                      }
                    })}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-center text-2xl tracking-widest text-gray-900 bg-white"
                    placeholder="000000"
                    maxLength={8}
                  />
                  <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
                )}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        await authService.requestOTP(email);
                        toast.success('Kode OTP baru telah dikirim');
                      } catch (error: any) {
                        toast.error('Gagal mengirim ulang kode OTP');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    disabled={isLoading}
                  >
                    Kirim ulang kode OTP
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Kembali
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lanjutkan
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
          <button
            type="submit"
            disabled={isLoading}
                className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses...' : 'Daftar'}
          </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};