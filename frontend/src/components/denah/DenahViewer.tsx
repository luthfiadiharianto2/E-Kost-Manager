import React, { Suspense, lazy, useMemo, useState } from 'react';
import { Box, Check, Grid3x3, Map as MapIcon, Move, RotateCcw } from 'lucide-react';
import type { KostLayout } from '../../lib/layoutPresets';
import type { LayoutRoom } from '../../services/layoutService';
import type { OwnerTenant } from '../../services/invitationService';
import { FloorSelector } from './FloorSelector';
import { Legend } from './Legend';
import { RoomDetailPanel } from './RoomDetailPanel';
import { FlatPlan } from './FlatPlan';
import {
  hasWebGL,
  isCoarsePointer,
  isPlaced,
  prefersReducedMotion,
  summarize,
  type FloorFilter,
  type StatusFilter,
  type ViewMode,
} from './denahUtils';

// three.js hanya dimuat saat dibutuhkan agar bundle halaman lain tidak membengkak
const KostScene = lazy(() => import('./KostScene'));

interface DenahViewerProps {
  layout: KostLayout;
  rooms: LayoutRoom[];
  isOwner: boolean;
  tenants?: OwnerTenant[];
  onAssign?: (roomId: number, tenantId: string | null) => Promise<void>;
}

const pill = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
    active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;

export const DenahViewer: React.FC<DenahViewerProps> = ({ layout, rooms, isOwner, tenants, onAssign }) => {
  const webgl = useMemo(() => hasWebGL(), []);
  const [mode, setMode] = useState<ViewMode>(() => (!webgl || prefersReducedMotion() ? '2d' : '2.5d'));
  const [floorFilter, setFloorFilter] = useState<FloorFilter>('all');
  const [exploded, setExploded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);
  // Di perangkat sentuh denah mulai terkunci agar halaman tetap bisa di-scroll
  const coarse = useMemo(() => isCoarsePointer(), []);
  const [interactive, setInteractive] = useState(() => !coarse);

  const stats = summarize(rooms);
  const unplaced = rooms.filter((r) => !isPlaced(r)).length;
  const selected = rooms.find((r) => r.id === selectedId) ?? null;
  const floorValue: FloorFilter = floorFilter !== 'all' && floorFilter > layout.floors ? 'all' : floorFilter;

  return (
    <div className="space-y-4">
      {/* Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Kamar</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Kosong</p>
          <p className="text-2xl font-bold text-green-600">{stats.kosong}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Terisi</p>
          <p className="text-2xl font-bold text-red-600">{stats.terisi}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Okupansi</p>
          <p className="text-2xl font-bold text-blue-600">{stats.okupansi}%</p>
        </div>
      </div>

      {/* Kontrol */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={pill(mode === '2.5d')} onClick={() => setMode('2.5d')} disabled={!webgl}>
            <MapIcon className="w-4 h-4" /> 2.5D
          </button>
          <button type="button" className={pill(mode === '3d')} onClick={() => setMode('3d')} disabled={!webgl}>
            <Box className="w-4 h-4" /> 3D
          </button>
          <button type="button" className={pill(mode === '2d')} onClick={() => setMode('2d')}>
            <Grid3x3 className="w-4 h-4" /> 2D Datar
          </button>
          {mode !== '2d' && (
            <button
              type="button"
              onClick={() => setResetKey((k) => k + 1)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Reset tampilan
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 mr-1">Status:</span>
          {(['all', 'tersedia', 'terisi'] as StatusFilter[]).map((s) => (
            <button key={s} type="button" className={pill(statusFilter === s)} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'Semua' : s === 'tersedia' ? 'Kosong' : 'Terisi'}
            </button>
          ))}
        </div>
      </div>

      <FloorSelector
        floors={layout.floors}
        value={floorValue}
        onChange={setFloorFilter}
        exploded={exploded}
        onExplodedChange={mode === '2d' ? undefined : setExploded}
      />

      {!webgl && (
        <p className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          Perangkat ini tidak mendukung WebGL, denah ditampilkan dalam mode datar 2D.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {mode === '2d' ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 min-h-[60vh]">
              <FlatPlan
                layout={layout}
                rooms={rooms}
                floorFilter={floorValue}
                statusFilter={statusFilter}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          ) : (
            <div
              className={`relative h-[55vh] min-h-[340px] md:h-[60vh] md:min-h-[420px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50 ${
                interactive ? 'touch-none' : 'touch-pan-y'
              }`}
            >
              {coarse && (
                <button
                  type="button"
                  onClick={() => setInteractive((v) => !v)}
                  className={`absolute top-2 right-2 z-10 px-3 py-1.5 rounded-lg text-sm font-medium shadow flex items-center gap-1.5 transition-colors ${
                    interactive ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-700 border border-gray-300'
                  }`}
                >
                  {interactive ? <Check className="w-4 h-4" /> : <Move className="w-4 h-4" />}
                  {interactive ? 'Selesai' : mode === '3d' ? 'Putar / zoom' : 'Geser / zoom'}
                </button>
              )}
              <Suspense
                fallback={
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                  </div>
                }
              >
                <KostScene
                  layout={layout}
                  rooms={rooms}
                  mode={mode}
                  floorFilter={floorValue}
                  exploded={exploded}
                  statusFilter={statusFilter}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  resetKey={resetKey}
                  interactive={interactive}
                />
              </Suspense>
            </div>
          )}
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Legend showMine={!isOwner} />
            {mode !== '2d' && (
              <p className="text-xs text-gray-500">
                {coarse && !interactive
                  ? 'Ketuk kamar untuk melihat detail. Tekan tombol di pojok denah untuk menggeser/zoom.'
                  : mode === '3d' ? 'Seret untuk memutar, scroll/cubit untuk zoom, klik kanan/dua jari untuk geser.' : 'Seret untuk menggeser, scroll/cubit untuk zoom.'}
              </p>
            )}
          </div>
          {isOwner && unplaced > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {unplaced} kamar belum ditempatkan di denah. Buka tab <span className="font-medium">Atur Denah</span> untuk menempatkannya.
            </p>
          )}
        </div>
        <div>
          <RoomDetailPanel
            room={selected}
            isOwner={isOwner}
            tenants={tenants}
            onAssign={onAssign}
            onClose={() => setSelectedId(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default DenahViewer;
