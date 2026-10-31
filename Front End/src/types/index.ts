export interface LoginResponse {
  token: string;
  user: User;
}
export interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  role: 'admin' | 'tenant';
  phone?: string;
  whatsapp?: string;
  address?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  ownerProfile?: {
    id: number;
    nama_kost?: string;
    alamat?: string;
    kode_pos?: string;
    provinsi?: string;
    kota?: string;
    kecamatan?: string;
    kelurahan?: string;
    pilihan_pembayaran?: string;
  } | null;
  kosts?: {
    id: number;
    user_id: number;
    nama_kost: string;
    alamat_kost: string;
    jumlah_kamar: number;
    harga: number;
    created_at: string;
    updated_at: string;
  }[];
}

export interface Kost {
  id: number;
  name: string;
  address: string;
  description: string;
  price: number;
  capacity: number;
  available_rooms: number;
  facilities: string[];
  images: string[];
  admin_id: number;
  created_at: string;
  updated_at: string;
}

export interface RoomType {
  id: number;
  name: string;
  price: number;
  facilities: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: number;
  kost_id: number;
  room_number: string;
  room_type_id?: number;
  room_type?: RoomType;
  price: number;
  is_available: boolean;
  tenant_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  tenant_id: number;
  room_id: number;
  amount: number;
  due_date: string;
  paid_at?: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: number;
  tenant_id: number;
  kost_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  // Required fields
  email: string;
  password: string;
  
  // Optional fields (semua pakai ?)
  name?: string;
  confirmPassword?: string;
  phone?: string;
  accessCode?: string;
  role?: 'admin' | 'tenant';
  
  // admin-specific fields
  namaKost?: string;
  namaPemilik?: string;
  whatsapp?: string;
  alamat?: string;
  kodePos?: string;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  pilihanPembayaran?: string;
  otp?: string;
}

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  email: string;
  otp?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
}