import type { CellType, KostLayout, RoomPlacement } from '../../lib/layoutPresets';
import type { LayoutRoom } from '../../services/layoutService';

// Warna konsisten dengan kelas Tailwind yang dipakai di halaman lain (green-500 / red-500 / yellow-400)
export const STATUS_COLOR = {
  tersedia: '#22c55e',
  terisi: '#ef4444',
} as const;
export const MINE_COLOR = '#facc15';

export const CELL_COLOR: Record<CellType, string> = {
  room: '#f3f4f6',
  corridor: '#e5e7eb',
  stairs: '#9ca3af',
  bath: '#bfdbfe',
  void: 'transparent',
};

export const STATUS_LABEL = { tersedia: 'Kosong', terisi: 'Terisi' } as const;

export type StatusFilter = 'all' | 'tersedia' | 'terisi';
export type FloorFilter = 'all' | number;
export type ViewMode = '2.5d' | '3d' | '2d';

export const formatRupiah = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

export const isPlaced = (r: LayoutRoom): r is LayoutRoom & { grid_x: number; grid_y: number } =>
  r.grid_x !== null && r.grid_y !== null;

export const toPlacements = (rooms: LayoutRoom[]): RoomPlacement[] =>
  rooms.filter(isPlaced).map((r) => ({
    id: r.id,
    floor: r.floor,
    grid_x: r.grid_x,
    grid_y: r.grid_y,
    span_x: r.span_x,
    span_y: r.span_y,
    door_side: r.door_side,
  }));

export const matchesFilter = (room: LayoutRoom, filter: StatusFilter) => filter === 'all' || room.status === filter;

export function summarize(rooms: LayoutRoom[]) {
  const total = rooms.length;
  const terisi = rooms.filter((r) => r.status === 'terisi').length;
  const kosong = total - terisi;
  return { total, terisi, kosong, okupansi: total ? Math.round((terisi / total) * 100) : 0 };
}

export const visibleFloors = (layout: KostLayout, filter: FloorFilter) =>
  filter === 'all' ? Array.from({ length: layout.floors }, (_, i) => i + 1) : [filter];

let webglCache: boolean | null = null;
export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement('canvas');
    webglCache = !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Perangkat sentuh (HP/tablet): jari di atas denah harus tetap bisa men-scroll halaman. */
export const isCoarsePointer = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
