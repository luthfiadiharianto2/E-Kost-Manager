import React, { useEffect, useState } from 'react';
import { Edit, User as UserIcon, X } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ProfileSectionProps {
  user: User;
  onUpdate?: (updatedUser: User) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onUpdate }) => {
  const { setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    email: user.email || '',
    whatsapp: user.whatsapp || user.phone || '',
    address: user.address || '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updateData: any = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        whatsapp: formData.whatsapp,
        address: formData.address,
      };

      if (formData.password) {
        updateData.password = formData.password;
        updateData.password_confirmation = formData.password;
      }

      const updatedUser = await authService.updateProfile(updateData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdate) {
        onUpdate(updatedUser);
      }
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      whatsapp: user.whatsapp || user.phone || '',
      address: user.address || '',
      password: '',
    });
    setIsEditing(false);
  };

const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();

    formData.append('avatar', file);

    try {
      const updatedUser = await authService.updateProfile(formData);

      setUser(updatedUser); 
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdate) {
        onUpdate(updatedUser);
      }
      toast.success('Foto profil berhasil diperbarui');
      setIsEditingPhoto(false);

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload foto');
    }
  };

  useEffect(() => {
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      whatsapp: user.whatsapp || user.phone || '',
      address: user.address || '',
      password: '',
    });
  }, [user]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Profil</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Simpan
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Details - Left Side */}
        <div className="flex-1 space-y-5">
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-700 w-40">Nama</span>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="flex-1 text-base font-semibold text-gray-900">{user.name || '-'}</span>
              )}
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-700 w-40">Username</span>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="flex-1 text-base font-semibold text-gray-900">{user.username || '-'}</span>
              )}
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-700 w-40">Email</span>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="flex-1 text-base font-semibold text-gray-900">{user.email || '-'}</span>
              )}
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-700 w-40">Nomor WhatsApp</span>
              {isEditing ? (
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="+62 812 345 6789"
                  className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="flex-1 text-base font-semibold text-gray-900">{user.whatsapp || user.phone || '-'}</span>
              )}
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-700 w-40">Alamat</span>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="flex-1 text-base font-semibold text-gray-900 whitespace-pre-line">{user.address || '-'}</span>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700 w-40">Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Profile Picture - Right Side */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-24 h-24 text-gray-400" />
              )}
            </div>
            <button
              onClick={() => setIsEditingPhoto(true)}
              className="absolute bottom-2 right-2 bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Edit className="w-5 h-5" />
            </button>
            {isEditingPhoto && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                >
                  Pilih Foto
                </label>
                <button
                  onClick={() => setIsEditingPhoto(false)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

