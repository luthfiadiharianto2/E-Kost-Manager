import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Building2, Home, Plus, List, Edit, Trash2, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roomService, OwnerRoom, OwnerRoomType } from '../../services/roomService';

export const AdminFacilitiesPage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'rooms' | 'room-types' | 'add-room-type' | 'edit-room-type' | 'add-room' | 'edit-property'>('rooms');
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  // Daftar tipe kamar milik owner (real-time dari backend)
  const [roomTypes, setRoomTypes] = useState<{
    id: string;
    name: string;
    price: number;
    facilities: string;
    description?: string;
  }[]>([]);

  // Daftar kamar milik owner (real-time dari backend)
  const [rooms, setRooms] = useState<{
    id: string;
    roomNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    price: string;
    isAvailable: boolean;
    tenant: string | null;
  }[]>([]);

  // Form data untuk edit properti (berdasarkan data pemilik)
  const [propertyForm, setPropertyForm] = useState({
    name: '',
    address: '',
    description: '',
    facilities: '',
  });

  // Hitung info properti berdasarkan data owner profile / kost
  const primaryKost = user?.kosts && user.kosts.length > 0 ? user.kosts[0] : undefined;
  const profileKost = user?.ownerProfile || null;

  const propertyName = propertyForm.name || profileKost?.nama_kost || primaryKost?.nama_kost || 'Kost Anda';
  const propertyAddress = propertyForm.address || profileKost?.alamat || primaryKost?.alamat_kost || 'Alamat belum diisi';
  const propertyDescription = propertyForm.description || 'Kost nyaman dengan fasilitas lengkap';
  const propertyFacilities = propertyForm.facilities || 'WiFi, AC, Kamar Mandi Dalam, Parkir';

  // Ambil daftar kamar & tipe kamar dari backend saat halaman dibuka
  useEffect(() => {
    const fetchRoomsAndTypes = async () => {
      try {
        // Room types
        const types = await roomService.getOwnerRoomTypes();
        setRoomTypes(
          types.map((t: OwnerRoomType) => ({
            id: String(t.id),
            name: t.name,
            price: t.price,
            facilities: t.facilities || '',
            description: t.description || '',
          }))
        );

        // Rooms
        const data = await roomService.getOwnerRooms();
        setRooms(
          data.map((room: OwnerRoom) => ({
            id: String(room.id),
            roomNumber: room.nomor_kamar,
            roomTypeId: '', // belum ada tipe kamar terpisah di backend
            roomTypeName: room.tipe_kamar,
            price: `Rp ${room.harga_sewa.toLocaleString('id-ID')}`,
            isAvailable: room.status === 'tersedia',
            tenant: room.tenant_name,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch owner rooms or room types', error);
      }
    };

    fetchRoomsAndTypes();
  }, []);

  // Form data untuk tambah/edit tipe kamar
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    price: '',
    facilities: '',
    description: '',
  });

  // Form data untuk tambah/edit kamar
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    roomTypeId: '',
    isAvailable: true,
  });

  const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPropertyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomTypeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRoomTypeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setRoomForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update property functionality
    console.log('Property form submitted:', propertyForm);
    setActiveTab('rooms');
  };

  const handleEditRoomType = (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    if (roomType) {
      setRoomTypeForm({
        name: roomType.name,
        price: roomType.price.toString(),
        facilities: roomType.facilities,
        description: roomType.description || '',
      });
      setEditingRoomTypeId(roomTypeId);
      setActiveTab('edit-room-type');
    }
  };

  const handleRoomTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseInt(roomTypeForm.price || '0', 10);

    const save = async () => {
      if (editingRoomTypeId) {
        // Update existing room type via API
        const updated = await roomService.updateOwnerRoomType(Number(editingRoomTypeId), {
          name: roomTypeForm.name,
          price,
          facilities: roomTypeForm.facilities,
          description: roomTypeForm.description,
        });

        setRoomTypes(roomTypes.map(rt => 
          rt.id === editingRoomTypeId 
            ? {
                id: String(updated.id),
                name: updated.name,
                price: updated.price,
                facilities: updated.facilities || '',
                description: updated.description || '',
              }
            : rt
        ));
        setEditingRoomTypeId(null);
      } else {
        // Add new room type via API
        const created = await roomService.createOwnerRoomType({
          name: roomTypeForm.name,
          price,
          facilities: roomTypeForm.facilities,
          description: roomTypeForm.description,
        });

        const newRoomType = {
          id: String(created.id),
          name: created.name,
          price: created.price,
          facilities: created.facilities || '',
          description: created.description || '',
        };
        setRoomTypes([...roomTypes, newRoomType]);
      }

      setActiveTab('room-types');
      setRoomTypeForm({ name: '', price: '', facilities: '', description: '' });
    };

    save().catch((error) => {
      console.error('Failed to save room type', error);
    });
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const selectedRoomType = roomTypes.find(rt => rt.id === roomForm.roomTypeId);
      const hargaSewa = selectedRoomType ? selectedRoomType.price : 0;

      if (editingRoomId) {
        // Update existing room
        const updatedRoom = await roomService.updateOwnerRoom(Number(editingRoomId), {
          nomor_kamar: roomForm.roomNumber,
          tipe_kamar: selectedRoomType?.name || 'Standard',
          harga_sewa: hargaSewa,
          status: roomForm.isAvailable ? 'tersedia' : 'terisi',
        });

        setRooms(rooms.map((room) =>
          room.id === editingRoomId
            ? {
                id: String(updatedRoom.id),
                roomNumber: updatedRoom.nomor_kamar,
                roomTypeId: roomForm.roomTypeId,
                roomTypeName: updatedRoom.tipe_kamar,
                price: `Rp ${updatedRoom.harga_sewa.toLocaleString('id-ID')}`,
                isAvailable: updatedRoom.status === 'tersedia',
                tenant: updatedRoom.tenant_name || null,
              }
            : room
        ));
      } else {
        // Create new room
        const createdRoom = await roomService.createOwnerRoom({
          nomor_kamar: roomForm.roomNumber,
          tipe_kamar: selectedRoomType?.name || 'Standard',
          harga_sewa: hargaSewa,
          status: roomForm.isAvailable ? 'tersedia' : 'terisi',
        });

        const newRoom = {
          id: String(createdRoom.id),
          roomNumber: createdRoom.nomor_kamar,
          roomTypeId: roomForm.roomTypeId,
          roomTypeName: createdRoom.tipe_kamar,
          price: `Rp ${createdRoom.harga_sewa.toLocaleString('id-ID')}`,
          isAvailable: createdRoom.status === 'tersedia',
          tenant: createdRoom.tenant_name || null,
        };

        setRooms([...rooms, newRoom]);
      }

      setActiveTab('rooms');
      setRoomForm({ roomNumber: '', roomTypeId: '', isAvailable: true });
      setEditingRoomId(null);
    } catch (error) {
      console.error('Failed to save room', error);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await roomService.deleteOwnerRoom(Number(roomId));
      setRooms(rooms.filter(room => room.id !== roomId));
    } catch (error) {
      console.error('Failed to delete room', error);
    }
  };

  const handleDeleteRoomType = (roomTypeId: string) => {
    // Check if any room is using this type
    const roomsUsingType = rooms.filter(r => r.roomTypeId === roomTypeId);
    if (roomsUsingType.length > 0) {
      alert(`Tipe kamar ini sedang digunakan oleh ${roomsUsingType.length} kamar. Hapus kamar terlebih dahulu.`);
      return;
    }

    roomService.deleteOwnerRoomType(Number(roomTypeId))
      .then(() => {
        setRoomTypes(roomTypes.filter(rt => rt.id !== roomTypeId));
      })
      .catch((error) => {
        console.error('Failed to delete room type', error);
      });
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Fasilitas</h2>
        </div>

        {/* Info Properti */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">{propertyName}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{propertyAddress}</p>
              <p className="text-sm text-gray-700 mb-2">{propertyDescription}</p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Fasilitas:</span> {propertyFacilities}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('edit-property')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Properti
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rooms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Daftar Kamar
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('room-types');
                setEditingRoomTypeId(null);
                setRoomTypeForm({ name: '', price: '', facilities: '', description: '' });
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'room-types' || activeTab === 'add-room-type' || activeTab === 'edit-room-type'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tipe Kamar
              </div>
            </button>
            <button
              onClick={() => setActiveTab('add-room')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'add-room'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tambah Kamar
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div>
          {/* Tab: Daftar Kamar */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Total Kamar: <span className="font-semibold text-gray-900">{rooms.length}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Tersedia: <span className="font-semibold text-green-600">
                      {rooms.filter(r => r.isAvailable).length}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('add-room')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Kamar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`border-2 rounded-lg p-4 ${
                      room.isAvailable
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Home className={`w-5 h-5 ${room.isAvailable ? 'text-green-600' : 'text-gray-400'}`} />
                        <h3 className="text-lg font-semibold text-gray-900">{room.roomNumber}</h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        room.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {room.isAvailable ? 'Tersedia' : 'Terisi'}
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-900">{room.price}</p>
                      <p className="text-xs text-gray-500">Tipe: {room.roomTypeName}</p>
                    </div>
                    {room.tenant && (
                      <p className="text-xs text-gray-600 mb-3">
                        Penyewa: <span className="font-medium">{room.tenant}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingRoomId(room.id);
                          const matchedType = roomTypes.find(rt => rt.name === room.roomTypeName);
                          setRoomForm({
                            roomNumber: room.roomNumber,
                            roomTypeId: matchedType ? matchedType.id : '',
                            isAvailable: room.isAvailable,
                          });
                          setActiveTab('add-room');
                        }}
                        className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {rooms.length === 0 && (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Belum ada kamar. Tambah kamar pertama Anda.</p>
                  <button
                    onClick={() => setActiveTab('add-room')}
                    className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Kamar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Edit Properti */}
          {activeTab === 'edit-property' && (
            <form onSubmit={handlePropertySubmit} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Properti
                </label>
                <input
                  type="text"
                  name="name"
                  value={propertyForm.name}
                  onChange={handlePropertyInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama properti"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={propertyForm.address}
                  onChange={handlePropertyInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan alamat lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={propertyForm.description}
                  onChange={handlePropertyInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan deskripsi properti"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasilitas (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  name="facilities"
                  value={propertyForm.facilities}
                  onChange={handlePropertyInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: WiFi, AC, Kamar Mandi Dalam, Parkir"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('rooms')}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          {/* Tab: Tipe Kamar */}
          {activeTab === 'room-types' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Total Tipe: <span className="font-semibold text-gray-900">{roomTypes.length}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingRoomTypeId(null);
                    setRoomTypeForm({ name: '', price: '', facilities: '', description: '' });
                    setActiveTab('add-room-type');
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Tipe Kamar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomTypes.map((roomType) => (
                  <div
                    key={roomType.id}
                    className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{roomType.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditRoomType(roomType.id)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoomType(roomType.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      Rp {roomType.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">{roomType.description}</p>
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs font-medium text-gray-700 mb-1">Fasilitas:</p>
                      <p className="text-xs text-gray-600">{roomType.facilities}</p>
                    </div>
                  </div>
                ))}
              </div>

              {roomTypes.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Belum ada tipe kamar. Tambah tipe kamar pertama Anda.</p>
                  <button
                    onClick={() => {
                      setEditingRoomTypeId(null);
                      setRoomTypeForm({ name: '', price: '', facilities: '', description: '' });
                      setActiveTab('add-room-type');
                    }}
                    className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Tipe Kamar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Tambah/Edit Tipe Kamar */}
          {(activeTab === 'add-room-type' || activeTab === 'edit-room-type') && (
            <form onSubmit={handleRoomTypeSubmit} className="space-y-6 max-w-2xl">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingRoomTypeId ? 'Edit Tipe Kamar' : 'Tambah Tipe Kamar'}
                </h3>
                <p className="text-sm text-gray-600">
                  {editingRoomTypeId ? 'Ubah informasi tipe kamar' : 'Buat tipe kamar baru dengan harga dan fasilitas tertentu'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Tipe Kamar
                </label>
                <input
                  type="text"
                  name="name"
                  value={roomTypeForm.name}
                  onChange={handleRoomTypeInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Contoh: Standard, Deluxe, Premium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Sewa (per bulan)
                </label>
                <input
                  type="number"
                  name="price"
                  value={roomTypeForm.price}
                  onChange={handleRoomTypeInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Rp 0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={roomTypeForm.description}
                  onChange={handleRoomTypeInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Deskripsi singkat tentang tipe kamar ini"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasilitas (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  name="facilities"
                  value={roomTypeForm.facilities}
                  onChange={handleRoomTypeInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Contoh: AC, WiFi, Kamar Mandi Dalam, TV"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('room-types');
                    setEditingRoomTypeId(null);
                    setRoomTypeForm({ name: '', price: '', facilities: '', description: '' });
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  {editingRoomTypeId ? (
                    <>
                      <Edit className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Tambah Tipe Kamar
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tab: Tambah Kamar */}
          {activeTab === 'add-room' && (
            <form onSubmit={handleRoomSubmit} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Tipe Kamar *
                </label>
                <select
                  name="roomTypeId"
                  value={roomForm.roomTypeId}
                  onChange={handleRoomInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih tipe kamar</option>
                  {roomTypes.map((roomType) => (
                    <option key={roomType.id} value={roomType.id}>
                      {roomType.name} - Rp {roomType.price.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
                {roomForm.roomTypeId && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const selectedType = roomTypes.find(rt => rt.id === roomForm.roomTypeId);
                      return selectedType ? (
                        <>
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            Harga: Rp {selectedType.price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-gray-600">
                            Fasilitas: {selectedType.facilities}
                          </p>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Kamar
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={roomForm.roomNumber}
                  onChange={handleRoomInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Contoh: A-101"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={roomForm.isAvailable}
                  onChange={handleRoomInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Kamar tersedia
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('rooms')}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Kamar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

