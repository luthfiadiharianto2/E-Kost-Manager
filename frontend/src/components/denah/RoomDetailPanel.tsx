import React, { useEffect, useState } from 'react';
import { DoorOpen, Home, Star, UserRound, X } from 'lucide-react';
import type { LayoutRoom } from '../../services/layoutService';
import type { OwnerTenant } from '../../services/invitationService';
import { formatRupiah, STATUS_LABEL } from './denahUtils';

interface RoomDetailPanelProps {
  room: LayoutRoom | null;
  isOwner: boolean;
  tenants?: OwnerTenant[];
  onAssign?: (roomId: number, tenantId: string | null) => Promise<void>;
  onClose: () => void;
}

export const RoomDetailPanel: React.FC<RoomDetailPanelProps> = ({ room, isOwner, tenants = [], onAssign, onClose }) => {
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedTenant(room?.tenant_id ?? '');
  }, [room?.id, room?.tenant_id]);

  if (!room) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Klik salah satu kamar pada denah untuk melihat detailnya.</p>
      </div>
    );
  }

  const isEmpty = room.status === 'tersedia';
  const changed = (selectedTenant || null) !== (room.tenant_id || null);

  const handleAssign = async () => {
    if (!onAssign) return;
    try {
      setSaving(true);
      await onAssign(room.id, selectedTenant || null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${isEmpty ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {isEmpty ? <DoorOpen className="w-5 h-5 text-green-600" /> : <UserRound className="w-5 h-5 text-red-600" />}
          <h3 className="text-lg font-semibold text-gray-900">Kamar {room.nomor_kamar}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Tutup detail">
          <X className="w-5 h-5" />
        </button>
      </div>

      {room.is_mine && (
        <div className="mb-4 flex items-center gap-2 bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-2 rounded-lg">
          <Star className="w-4 h-4" /> Kamar Anda
        </div>
      )}

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">Status</dt>
          <dd>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                isEmpty ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {STATUS_LABEL[room.status]}
            </span>
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Tipe</dt>
          <dd className="font-medium text-gray-900">{room.tipe_kamar}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Harga sewa</dt>
          <dd className="font-semibold text-gray-900">{formatRupiah(room.harga_sewa)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Lantai</dt>
          <dd className="font-medium text-gray-900">{room.floor}</dd>
        </div>
        {isOwner && (
          <div className="flex justify-between">
            <dt className="text-gray-600">Penghuni</dt>
            <dd className="font-medium text-gray-900">{room.tenant_name || '-'}</dd>
          </div>
        )}
      </dl>

      {isOwner && onAssign && (
        <div className="mt-5 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Atur penghuni</label>
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">— Kosongkan kamar —</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.room && t.id !== room.tenant_id ? ` (kamar ${t.room})` : ''}
              </option>
            ))}
          </select>
          {tenants.length === 0 && (
            <p className="mt-2 text-xs text-gray-500">Belum ada penyewa yang menerima undangan Anda.</p>
          )}
          <button
            type="button"
            onClick={handleAssign}
            disabled={!changed || saving}
            className="mt-3 w-full px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan...' : 'Simpan Penghuni'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomDetailPanel;
