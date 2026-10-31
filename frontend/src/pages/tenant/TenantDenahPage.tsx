import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { TenantLayout } from '../../components/TenantLayout';
import { DenahViewer } from '../../components/denah/DenahViewer';
import { layoutService, type KostLayoutData } from '../../services/layoutService';

// Denah untuk penyewa: read-only, hanya status & nomor kamar (nama penghuni lain tidak dikirim server)
export const TenantDenahPage: React.FC = () => {
  const [kostId, setKostId] = useState<number | null>(null);
  const [data, setData] = useState<KostLayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetchTimer = useRef<number | undefined>(undefined);

  const load = useCallback(async (id: number) => {
    try {
      setError(null);
      setData(await layoutService.getLayout(id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat denah');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    layoutService
      .getTenantKostId()
      .then((id) => {
        setKostId(id);
        if (id === null) setLoading(false);
        else load(id);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Gagal memuat data kamar');
        setLoading(false);
      });
  }, [load]);

  useEffect(() => {
    if (kostId === null) return;
    const unsubscribe = layoutService.subscribeRooms(kostId, () => {
      window.clearTimeout(refetchTimer.current);
      refetchTimer.current = window.setTimeout(() => load(kostId), 300);
    });
    const onFocus = () => load(kostId);
    window.addEventListener('focus', onFocus);
    return () => {
      unsubscribe();
      window.removeEventListener('focus', onFocus);
      window.clearTimeout(refetchTimer.current);
    };
  }, [kostId, load]);

  return (
    <TenantLayout>
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500 rounded-lg">
            <MapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Denah Kost</h2>
            {data?.kost && <p className="text-sm text-gray-600">{data.kost.nama_kost}</p>}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{error}</div>
        ) : kostId === null ? (
          <div className="text-center py-12">
            <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Anda belum ditempatkan di kamar mana pun oleh pemilik kost.</p>
          </div>
        ) : data && !data.layout ? (
          <div className="text-center py-12">
            <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Pemilik belum mengatur denah.</p>
          </div>
        ) : data && data.layout ? (
          <DenahViewer layout={data.layout} rooms={data.rooms} isOwner={false} />
        ) : null}
      </div>
    </TenantLayout>
  );
};

export default TenantDenahPage;
