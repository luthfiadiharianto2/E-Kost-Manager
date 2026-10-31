import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, Map as MapIcon, PencilRuler, Wand2 } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { DenahViewer } from '../../components/denah/DenahViewer';
import { LayoutEditor } from '../../components/denah/LayoutEditor';
import { useAuth } from '../../contexts/AuthContext';
import { autoLayout } from '../../lib/layoutPresets';
import { layoutService, type KostLayoutData } from '../../services/layoutService';
import { invitationService, type OwnerTenant } from '../../services/invitationService';
import { roomService } from '../../services/roomService';

type Tab = 'view' | 'edit';

export const AdminLayoutPage: React.FC = () => {
  const { user } = useAuth();
  const kosts = user?.kosts ?? [];
  const [kostId, setKostId] = useState<number | null>(kosts[0]?.id ?? null);
  const [data, setData] = useState<KostLayoutData | null>(null);
  const [tenants, setTenants] = useState<OwnerTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('view');
  const [creating, setCreating] = useState(false);
  const refetchTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (kostId === null && kosts.length > 0) setKostId(kosts[0].id);
  }, [kosts, kostId]);

  const load = useCallback(async () => {
    if (kostId === null) return;
    try {
      setError(null);
      setData(await layoutService.getLayout(kostId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat denah');
    } finally {
      setLoading(false);
    }
  }, [kostId]);

  useEffect(() => {
    if (kostId === null) {
      setLoading(false);
      return;
    }
    setLoading(true);
    load();
    invitationService.getOwnerTenants().then(setTenants).catch(() => setTenants([]));

    // Realtime: warna kamar ikut berubah saat penghuni di-assign dari halaman/perangkat lain
    const unsubscribe = layoutService.subscribeRooms(kostId, () => {
      window.clearTimeout(refetchTimer.current);
      refetchTimer.current = window.setTimeout(load, 300);
    });
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      unsubscribe();
      window.removeEventListener('focus', onFocus);
      window.clearTimeout(refetchTimer.current);
    };
  }, [kostId, load]);

  const handleAssign = async (roomId: number, tenantId: string | null) => {
    try {
      await roomService.assignTenantToRoom(roomId, tenantId);
      toast.success(tenantId ? 'Penghuni kamar berhasil disimpan' : 'Kamar dikosongkan');
      await load();
      invitationService.getOwnerTenants().then(setTenants).catch(() => undefined);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui penghuni kamar');
    }
  };

  const handleCreateAuto = async () => {
    if (!data || kostId === null) return;
    if (data.rooms.length === 0) {
      toast.error('Belum ada kamar. Tambah kamar di menu Fasilitas terlebih dahulu.');
      return;
    }
    try {
      setCreating(true);
      const { layout, placements, unplaced } = autoLayout(data.rooms, 'lorong_tengah');
      const saved = await layoutService.saveLayout(kostId, layout, placements);
      setData(saved);
      toast.success(
        unplaced.length ? `Denah dibuat, ${unplaced.length} kamar belum ditempatkan.` : 'Denah otomatis berhasil dibuat'
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat denah');
    } finally {
      setCreating(false);
    }
  };

  const tabClass = (active: boolean) =>
    `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
      active ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500 rounded-lg">
              <MapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Denah Kost</h2>
              {data?.kost && <p className="text-sm text-gray-600">{data.kost.nama_kost}</p>}
            </div>
          </div>
          {kosts.length > 1 && (
            <select
              value={kostId ?? ''}
              onChange={(e) => {
                setKostId(Number(e.target.value));
                setTab('view');
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Pilih kost"
            >
              {kosts.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kost}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : kostId === null ? (
          <div className="text-center py-12">
            <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada data kost. Lengkapi profil kost Anda terlebih dahulu.</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{error}</div>
        ) : data ? (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button onClick={() => setTab('view')} className={tabClass(tab === 'view')}>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Lihat Denah
                  </div>
                </button>
                <button onClick={() => setTab('edit')} className={tabClass(tab === 'edit')}>
                  <div className="flex items-center gap-2">
                    <PencilRuler className="w-4 h-4" />
                    Atur Denah
                  </div>
                </button>
              </nav>
            </div>

            {tab === 'view' &&
              (data.layout ? (
                <DenahViewer
                  layout={data.layout}
                  rooms={data.rooms}
                  isOwner
                  tenants={tenants}
                  onAssign={handleAssign}
                />
              ) : (
                <div className="text-center py-12">
                  <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-900 font-semibold mb-1">Denah kost belum dibuat</p>
                  <p className="text-gray-500 mb-6">
                    Buat denah otomatis dari {data.rooms.length} kamar yang ada, lalu sesuaikan di tab Atur Denah.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={handleCreateAuto}
                      disabled={creating}
                      className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Wand2 className="w-5 h-5" />
                      {creating ? 'Membuat...' : 'Buat denah otomatis'}
                    </button>
                    <button
                      onClick={() => setTab('edit')}
                      className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <PencilRuler className="w-5 h-5" />
                      Atur manual
                    </button>
                  </div>
                </div>
              ))}

            {tab === 'edit' && (
              <LayoutEditor
                key={`${kostId}-${data.layout?.updated_at ?? 'baru'}`}
                kostId={kostId}
                rooms={data.rooms}
                layout={data.layout}
                onSaved={(saved) => {
                  setData(saved);
                  setTab('view');
                }}
              />
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminLayoutPage;
