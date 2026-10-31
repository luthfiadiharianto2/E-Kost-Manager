// Fungsi murni untuk denah kost: preset bentuk bangunan, penempatan kamar otomatis, dan validasi.
// Tidak bergantung pada React/three.js agar mudah diuji.

export type CellType = 'room' | 'corridor' | 'void' | 'stairs' | 'bath';
export type BuildingType = 'memanjang' | 'lorong_tengah' | 'l' | 'u' | 'halaman_tengah' | 'kustom';
export type DoorSide = 'n' | 'e' | 's' | 'w';

export interface FootprintCell {
  x: number;
  y: number;
  t: CellType;
}

/** Jenis sel per lantai: { "1": [...], "2": [...] } */
export type Footprint = Record<string, FootprintCell[]>;

export interface KostLayout {
  building_type: BuildingType;
  floors: number;
  grid_cols: number;
  grid_rows: number;
  footprint: Footprint;
}

export interface RoomPlacement {
  id: number;
  floor: number;
  grid_x: number;
  grid_y: number;
  span_x: number;
  span_y: number;
  door_side: DoorSide | null;
}

export interface PlaceableRoom {
  id: number;
  nomor_kamar: string;
}

export const BUILDING_TYPES: { value: BuildingType; label: string; hint: string }[] = [
  { value: 'memanjang', label: 'Memanjang', hint: 'Satu deret kamar dengan satu lorong' },
  { value: 'lorong_tengah', label: 'Lorong Tengah', hint: 'Kamar di kiri dan kanan lorong' },
  { value: 'l', label: 'Bentuk L', hint: 'Dua sayap kamar membentuk huruf L' },
  { value: 'u', label: 'Bentuk U', hint: 'Tiga sayap kamar membentuk huruf U' },
  { value: 'halaman_tengah', label: 'Halaman Tengah', hint: 'Kamar mengelilingi halaman/void' },
  { value: 'kustom', label: 'Kustom', hint: 'Atur sendiri jenis setiap sel' },
];

export const CELL_TYPES: { value: CellType; label: string }[] = [
  { value: 'room', label: 'Ruang Kamar' },
  { value: 'corridor', label: 'Lorong' },
  { value: 'stairs', label: 'Tangga' },
  { value: 'bath', label: 'Kamar Mandi Bersama' },
  { value: 'void', label: 'Kosong / Void' },
];

export const GRID_LIMITS = { minCols: 2, maxCols: 40, minRows: 1, maxRows: 40, maxFloors: 10, maxSpan: 6 };

/** Ukuran grid minimum agar bentuk preset masuk akal. */
export const MIN_GRID: Record<BuildingType, { cols: number; rows: number }> = {
  memanjang: { cols: 2, rows: 2 },
  lorong_tengah: { cols: 2, rows: 3 },
  l: { cols: 3, rows: 3 },
  u: { cols: 5, rows: 3 },
  halaman_tengah: { cols: 5, rows: 5 },
  kustom: { cols: 2, rows: 1 },
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(v)));

export function normalizeGrid(type: BuildingType, cols: number, rows: number) {
  const min = MIN_GRID[type];
  return {
    cols: clamp(cols, Math.max(min.cols, GRID_LIMITS.minCols), GRID_LIMITS.maxCols),
    rows: clamp(rows, Math.max(min.rows, GRID_LIMITS.minRows), GRID_LIMITS.maxRows),
  };
}

/** Jenis sel untuk satu lantai berdasarkan preset. Grid dianggap sudah dinormalisasi. */
function presetCellType(type: BuildingType, x: number, y: number, cols: number, rows: number): CellType {
  switch (type) {
    case 'memanjang':
      // baris 0 kamar, baris 1 lorong (tangga di ujung kiri), sisanya void
      if (y === 0) return 'room';
      if (y === 1) return x === 0 ? 'stairs' : 'corridor';
      return 'void';

    case 'lorong_tengah':
      // kamar - lorong - kamar; baris lebih dari 3 dibiarkan void
      if (y === 0 || y === 2) return 'room';
      if (y === 1) return x === 0 ? 'stairs' : 'corridor';
      return 'void';

    case 'l':
      // sayap atas (y=0) dan sayap kiri (x=0); lorong menempel di sisi dalam.
      // Sudut luar dibiarkan void: tidak punya akses pintu ke lorong.
      if (x === 0 && y === 0) return 'void';
      if (y === 0 || x === 0) return 'room';
      if (x === 1 && y === 1) return 'stairs';
      if (y === 1 || x === 1) return 'corridor';
      return 'void';

    case 'u':
      // sayap kiri, atas, kanan; lorong di sisi dalam; tengah void (terbuka ke bawah)
      if (y === 0 && (x === 0 || x === cols - 1)) return 'void';
      if (y === 0 || x === 0 || x === cols - 1) return 'room';
      if (x === 1 && y === 1) return 'stairs';
      if (y === 1 || x === 1 || x === cols - 2) return 'corridor';
      return 'void';

    case 'halaman_tengah': {
      // cincin kamar di keliling, cincin lorong di dalam, halaman di tengah
      const onEdge = y === 0 || y === rows - 1 || x === 0 || x === cols - 1;
      const corner = (x === 0 || x === cols - 1) && (y === 0 || y === rows - 1);
      if (corner) return 'void';
      if (onEdge) return 'room';
      const onInner = y === 1 || y === rows - 2 || x === 1 || x === cols - 2;
      if (x === 1 && y === 1) return 'stairs';
      if (onInner) return 'corridor';
      return 'void';
    }

    case 'kustom':
    default:
      return presetCellType('memanjang', x, y, cols, rows);
  }
}

export function presetFloor(type: BuildingType, cols: number, rows: number): FootprintCell[] {
  const cells: FootprintCell[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      cells.push({ x, y, t: presetCellType(type, x, y, cols, rows) });
    }
  }
  return cells;
}

export function generateFootprint(type: BuildingType, floors: number, cols: number, rows: number): Footprint {
  const fp: Footprint = {};
  const base = presetFloor(type, cols, rows);
  for (let f = 1; f <= floors; f++) fp[String(f)] = base.map((c) => ({ ...c }));
  return fp;
}

export function cellAt(footprint: Footprint, floor: number, x: number, y: number): CellType {
  return footprint[String(floor)]?.find((c) => c.x === x && c.y === y)?.t ?? 'void';
}

/** Ubah jenis satu sel (mengembalikan footprint baru). */
export function paintCell(footprint: Footprint, floor: number, x: number, y: number, t: CellType): Footprint {
  const key = String(floor);
  const cells = (footprint[key] || []).filter((c) => !(c.x === x && c.y === y));
  cells.push({ x, y, t });
  cells.sort((a, b) => a.y - b.y || a.x - b.x);
  return { ...footprint, [key]: cells };
}

/** Salin pola satu lantai ke semua lantai lain. */
export function copyFloorPattern(footprint: Footprint, fromFloor: number, floors: number): Footprint {
  const src = footprint[String(fromFloor)] || [];
  const out: Footprint = {};
  for (let f = 1; f <= floors; f++) out[String(f)] = src.map((c) => ({ ...c }));
  return out;
}

/** Sesuaikan footprint ke jumlah lantai/ukuran grid baru: sel lama dipertahankan, sel baru void. */
export function resizeFootprint(footprint: Footprint, floors: number, cols: number, rows: number): Footprint {
  const out: Footprint = {};
  for (let f = 1; f <= floors; f++) {
    const src = footprint[String(f)] ?? footprint['1'] ?? [];
    const cells: FootprintCell[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        cells.push({ x, y, t: src.find((c) => c.x === x && c.y === y)?.t ?? 'void' });
      }
    }
    out[String(f)] = cells;
  }
  return out;
}

const WALKABLE: CellType[] = ['corridor', 'stairs'];

/** Sisi pintu: sisi kamar yang bersebelahan dengan lorong/tangga. */
export function doorSideFor(
  layout: KostLayout,
  floor: number,
  x: number,
  y: number,
  spanX = 1,
  spanY = 1
): DoorSide | null {
  const check = (cx: number, cy: number) =>
    cx >= 0 && cy >= 0 && cx < layout.grid_cols && cy < layout.grid_rows &&
    WALKABLE.includes(cellAt(layout.footprint, floor, cx, cy));
  const sides: [DoorSide, () => boolean][] = [
    ['s', () => Array.from({ length: spanX }, (_, i) => check(x + i, y + spanY)).some(Boolean)],
    ['n', () => Array.from({ length: spanX }, (_, i) => check(x + i, y - 1)).some(Boolean)],
    ['e', () => Array.from({ length: spanY }, (_, i) => check(x + spanX, y + i)).some(Boolean)],
    ['w', () => Array.from({ length: spanY }, (_, i) => check(x - 1, y + i)).some(Boolean)],
  ];
  return sides.find(([, ok]) => ok())?.[0] ?? null;
}

/** Sel bertipe kamar pada satu lantai, diurutkan seperti alur bangunan. */
export function roomSlots(layout: KostLayout, floor: number): { x: number; y: number }[] {
  const slots = (layout.footprint[String(floor)] || []).filter((c) => c.t === 'room').map(({ x, y }) => ({ x, y }));
  const ring = layout.building_type === 'l' || layout.building_type === 'u' || layout.building_type === 'halaman_tengah';
  if (!ring) return slots.sort((a, b) => a.y - b.y || a.x - b.x);

  // urut searah jarum jam mengelilingi pusat (dimulai dari kiri atas)
  const cx = (layout.grid_cols - 1) / 2;
  const cy = (layout.grid_rows - 1) / 2;
  const angle = (p: { x: number; y: number }) => {
    const a = Math.atan2(p.y - cy, p.x - cx); // y ke bawah
    const start = Math.atan2(-cy, -cx);
    let d = a - start;
    while (d < 0) d += Math.PI * 2;
    return d;
  };
  return slots.sort((a, b) => angle(a) - angle(b) || a.y - b.y || a.x - b.x);
}

export function countRoomSlots(type: BuildingType, cols: number, rows: number): number {
  return presetFloor(type, cols, rows).filter((c) => c.t === 'room').length;
}

/** Ukuran grid terkecil (luas minimum, proporsi wajar) yang menampung `slotsNeeded` kamar per lantai. */
export function suggestGrid(type: BuildingType, slotsNeeded: number): { cols: number; rows: number } {
  const t: BuildingType = type === 'kustom' ? 'memanjang' : type;
  const need = Math.max(1, slotsNeeded);
  const min = MIN_GRID[t];
  let best: { cols: number; rows: number; area: number } | null = null;
  for (let rows = min.rows; rows <= GRID_LIMITS.maxRows; rows++) {
    for (let cols = min.cols; cols <= GRID_LIMITS.maxCols; cols++) {
      if (cols / rows > 4 && t !== 'memanjang' && t !== 'lorong_tengah') continue;
      if (countRoomSlots(t, cols, rows) >= need) {
        const area = cols * rows;
        if (!best || area < best.area || (area === best.area && Math.abs(cols - rows) < Math.abs(best.cols - best.rows))) {
          best = { cols, rows, area };
        }
        break; // kolom lebih banyak hanya memperbesar luas untuk baris ini
      }
    }
    // memanjang/lorong tengah tidak butuh baris lebih banyak
    if (best && (t === 'memanjang' || t === 'lorong_tengah')) break;
  }
  if (best) return { cols: best.cols, rows: best.rows };
  // tidak ada grid yang cukup: pakai kapasitas maksimum preset ini
  return normalizeGrid(t, GRID_LIMITS.maxCols, t === 'memanjang' ? 2 : t === 'lorong_tengah' ? 3 : GRID_LIMITS.maxRows);
}

/** Lantai dari nomor kamar (mis. "204" atau "A-204" -> 2), atau null bila tidak berpola. */
export function floorFromRoomNumber(nomor: string): number | null {
  const matches = nomor.match(/\d+/g);
  if (!matches) return null;
  const n = Number(matches[matches.length - 1]);
  if (!Number.isFinite(n) || n < 100) return null;
  const digits = String(n).length;
  return Math.floor(n / Math.pow(10, digits - (digits >= 4 ? 2 : 1)));
}

const naturalCompare = (a: string, b: string) => a.localeCompare(b, 'id', { numeric: true, sensitivity: 'base' });

/** Kelompokkan kamar per lantai: pakai pola nomor bila konsisten, kalau tidak dibagi rata. */
export function groupRoomsByFloor<T extends PlaceableRoom>(rooms: T[], floors: number): Map<number, T[]> {
  const sorted = [...rooms].sort((a, b) => naturalCompare(a.nomor_kamar, b.nomor_kamar));
  const groups = new Map<number, T[]>();
  for (let f = 1; f <= floors; f++) groups.set(f, []);

  const parsed = sorted.map((r) => floorFromRoomNumber(r.nomor_kamar));
  const patterned = parsed.length > 0 && parsed.every((f) => f !== null && f >= 1 && f <= floors);
  if (patterned) {
    sorted.forEach((r, i) => groups.get(parsed[i] as number)!.push(r));
    return groups;
  }
  const perFloor = Math.ceil(sorted.length / floors) || 1;
  sorted.forEach((r, i) => groups.get(Math.min(floors, Math.floor(i / perFloor) + 1))!.push(r));
  return groups;
}

/** Tempatkan kamar ke slot preset. Kamar yang tidak muat dikembalikan di `unplaced`. */
export function autoPlaceRooms<T extends PlaceableRoom>(
  rooms: T[],
  layout: KostLayout
): { placements: RoomPlacement[]; unplaced: T[] } {
  const groups = groupRoomsByFloor(rooms, layout.floors);
  const free = new Map<number, { x: number; y: number }[]>();
  for (let f = 1; f <= layout.floors; f++) free.set(f, roomSlots(layout, f));

  const placements: RoomPlacement[] = [];
  const overflow: T[] = [];

  const place = (room: T, floor: number) => {
    const slot = free.get(floor)!.shift()!;
    placements.push({
      id: room.id,
      floor,
      grid_x: slot.x,
      grid_y: slot.y,
      span_x: 1,
      span_y: 1,
      door_side: doorSideFor(layout, floor, slot.x, slot.y),
    });
  };

  for (let f = 1; f <= layout.floors; f++) {
    for (const room of groups.get(f) || []) {
      if (free.get(f)!.length > 0) place(room, f);
      else overflow.push(room);
    }
  }
  // kamar yang tidak muat di lantainya dipindah ke lantai lain yang masih punya slot
  const unplaced: T[] = [];
  for (const room of overflow) {
    const target = [...free.entries()].find(([, slots]) => slots.length > 0)?.[0];
    if (target) place(room, target);
    else unplaced.push(room);
  }
  return { placements, unplaced };
}

/** Pesan kesalahan penempatan (kosong = valid). */
export function validatePlacements(
  layout: Pick<KostLayout, 'floors' | 'grid_cols' | 'grid_rows'>,
  placements: RoomPlacement[],
  labelOf: (id: number) => string = (id) => `#${id}`
): string[] {
  const errors: string[] = [];
  const occupied = new Map<string, number>();
  for (const p of placements) {
    const label = labelOf(p.id);
    if (!Number.isInteger(p.floor) || p.floor < 1 || p.floor > layout.floors) {
      errors.push(`Kamar ${label}: lantai ${p.floor} di luar jumlah lantai (${layout.floors}).`);
      continue;
    }
    if (p.span_x < 1 || p.span_y < 1 || p.span_x > GRID_LIMITS.maxSpan || p.span_y > GRID_LIMITS.maxSpan) {
      errors.push(`Kamar ${label}: ukuran harus 1-${GRID_LIMITS.maxSpan} sel.`);
      continue;
    }
    if (p.grid_x < 0 || p.grid_y < 0 || p.grid_x + p.span_x > layout.grid_cols || p.grid_y + p.span_y > layout.grid_rows) {
      errors.push(`Kamar ${label}: berada di luar grid ${layout.grid_cols}x${layout.grid_rows}.`);
      continue;
    }
    for (let dx = 0; dx < p.span_x; dx++) {
      for (let dy = 0; dy < p.span_y; dy++) {
        const key = `${p.floor}:${p.grid_x + dx}:${p.grid_y + dy}`;
        const other = occupied.get(key);
        if (other !== undefined && other !== p.id) {
          const msg = `Kamar ${label} tumpang tindih dengan kamar ${labelOf(other)} (lantai ${p.floor}).`;
          if (!errors.includes(msg)) errors.push(msg);
        } else {
          occupied.set(key, p.id);
        }
      }
    }
  }
  return errors;
}

/** Id kamar yang menempati sel tertentu (memperhitungkan span), atau undefined. */
export function placementAt(placements: RoomPlacement[], floor: number, x: number, y: number): RoomPlacement | undefined {
  return placements.find(
    (p) => p.floor === floor && x >= p.grid_x && x < p.grid_x + p.span_x && y >= p.grid_y && y < p.grid_y + p.span_y
  );
}

/** Buat denah lengkap otomatis dari daftar kamar. */
export function autoLayout<T extends PlaceableRoom>(
  rooms: T[],
  type: BuildingType = 'lorong_tengah',
  floorsHint?: number
): { layout: KostLayout; placements: RoomPlacement[]; unplaced: T[] } {
  const parsedFloors = rooms.map((r) => floorFromRoomNumber(r.nomor_kamar));
  const patterned = rooms.length > 0 && parsedFloors.every((f) => f !== null && f >= 1 && f <= GRID_LIMITS.maxFloors);
  const floors = clamp(
    floorsHint ?? (patterned ? Math.max(...(parsedFloors as number[])) : Math.ceil(rooms.length / 8) || 1),
    1,
    GRID_LIMITS.maxFloors
  );
  const groups = groupRoomsByFloor(rooms, floors);
  const perFloor = Math.max(1, ...[...groups.values()].map((g) => g.length));
  const grid = suggestGrid(type, perFloor);
  const { cols, rows } = normalizeGrid(type, grid.cols, grid.rows);
  const layout: KostLayout = {
    building_type: type,
    floors,
    grid_cols: cols,
    grid_rows: rows,
    footprint: generateFootprint(type, floors, cols, rows),
  };
  const { placements, unplaced } = autoPlaceRooms(rooms, layout);
  return { layout, placements, unplaced };
}
