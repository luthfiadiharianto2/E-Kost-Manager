import { describe, expect, it } from 'vitest';
import {
  BUILDING_TYPES,
  BuildingType,
  autoLayout,
  autoPlaceRooms,
  cellAt,
  copyFloorPattern,
  countRoomSlots,
  doorSideFor,
  floorFromRoomNumber,
  generateFootprint,
  normalizeGrid,
  paintCell,
  placementAt,
  presetFloor,
  resizeFootprint,
  suggestGrid,
  validatePlacements,
  KostLayout,
  RoomPlacement,
} from './layoutPresets';

const rooms = (labels: string[]) => labels.map((nomor_kamar, i) => ({ id: i + 1, nomor_kamar }));
const presetTypes = BUILDING_TYPES.map((b) => b.value).filter((t) => t !== 'kustom') as BuildingType[];

const makeLayout = (type: BuildingType, floors: number, cols: number, rows: number): KostLayout => {
  const g = normalizeGrid(type, cols, rows);
  return { building_type: type, floors, grid_cols: g.cols, grid_rows: g.rows, footprint: generateFootprint(type, floors, g.cols, g.rows) };
};

describe('presetFloor', () => {
  it.each(presetTypes)('%s menghasilkan tepat satu sel valid untuk setiap koordinat grid', (type) => {
    const { cols, rows } = normalizeGrid(type, 8, 6);
    const cells = presetFloor(type, cols, rows);
    expect(cells).toHaveLength(cols * rows);
    const keys = new Set(cells.map((c) => `${c.x}:${c.y}`));
    expect(keys.size).toBe(cols * rows);
    for (const c of cells) {
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x).toBeLessThan(cols);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.y).toBeLessThan(rows);
      expect(['room', 'corridor', 'void', 'stairs', 'bath']).toContain(c.t);
    }
  });

  it.each(presetTypes)('%s punya ruang kamar, lorong, dan tangga', (type) => {
    const { cols, rows } = normalizeGrid(type, 8, 6);
    const types = new Set(presetFloor(type, cols, rows).map((c) => c.t));
    expect(types.has('room')).toBe(true);
    expect(types.has('corridor')).toBe(true);
    expect(types.has('stairs')).toBe(true);
  });

  it('setiap kamar preset bersebelahan dengan lorong/tangga (punya pintu)', () => {
    for (const type of presetTypes) {
      const layout = makeLayout(type, 1, 9, 7);
      for (const c of layout.footprint['1'].filter((c) => c.t === 'room')) {
        expect(doorSideFor(layout, 1, c.x, c.y), `${type} ${c.x},${c.y}`).not.toBeNull();
      }
    }
  });

  it('halaman tengah menyisakan void di tengah', () => {
    const layout = makeLayout('halaman_tengah', 1, 7, 7);
    expect(cellAt(layout.footprint, 1, 3, 3)).toBe('void');
  });
});

describe('normalizeGrid', () => {
  it('menaikkan grid ke ukuran minimum preset dan membatasi maksimum', () => {
    expect(normalizeGrid('halaman_tengah', 2, 2)).toEqual({ cols: 5, rows: 5 });
    expect(normalizeGrid('memanjang', 99, 99)).toEqual({ cols: 40, rows: 40 });
  });
});

describe('suggestGrid', () => {
  it.each(presetTypes)('%s: grid yang disarankan memuat jumlah kamar yang diminta', (type) => {
    const capacity = countRoomSlots(type, ...Object.values(normalizeGrid(type, 40, 40)) as [number, number]);
    for (const n of [1, 4, 7, 12, 25, 60, 500]) {
      const g = suggestGrid(type, n);
      expect(countRoomSlots(type, g.cols, g.rows)).toBeGreaterThanOrEqual(Math.min(n, capacity));
    }
  });
});

describe('floorFromRoomNumber', () => {
  it('membaca lantai dari pola nomor', () => {
    expect(floorFromRoomNumber('101')).toBe(1);
    expect(floorFromRoomNumber('A-204')).toBe(2);
    expect(floorFromRoomNumber('1003')).toBe(10);
    expect(floorFromRoomNumber('12')).toBeNull();
    expect(floorFromRoomNumber('Melati')).toBeNull();
  });
});

describe('autoPlaceRooms', () => {
  it('menempatkan kamar sesuai lantai pada nomornya, tanpa tumpang tindih', () => {
    const list = rooms(['101', '102', '103', '201', '202', '301']);
    const layout = makeLayout('lorong_tengah', 3, 4, 3);
    const { placements, unplaced } = autoPlaceRooms(list, layout);
    expect(unplaced).toHaveLength(0);
    expect(placements).toHaveLength(6);
    const floorOf = (nomor: string) => placements.find((p) => p.id === list.find((r) => r.nomor_kamar === nomor)!.id)!.floor;
    expect(floorOf('103')).toBe(1);
    expect(floorOf('202')).toBe(2);
    expect(floorOf('301')).toBe(3);
    expect(validatePlacements(layout, placements)).toEqual([]);
    for (const p of placements) expect(cellAt(layout.footprint, p.floor, p.grid_x, p.grid_y)).toBe('room');
  });

  it('membagi rata bila nomor tidak berpola dan memindahkan kelebihan ke lantai lain', () => {
    const list = rooms(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    const layout = makeLayout('memanjang', 2, 4, 2); // 4 slot per lantai
    const { placements, unplaced } = autoPlaceRooms(list, layout);
    expect(unplaced).toHaveLength(0);
    expect(placements.filter((p) => p.floor === 1)).toHaveLength(4);
    expect(placements.filter((p) => p.floor === 2)).toHaveLength(3);
    expect(validatePlacements(layout, placements)).toEqual([]);
  });

  it('mengembalikan kamar yang tidak muat sebagai unplaced', () => {
    const list = rooms(['1', '2', '3', '4', '5']);
    const layout = makeLayout('memanjang', 1, 3, 2);
    const { placements, unplaced } = autoPlaceRooms(list, layout);
    expect(placements).toHaveLength(3);
    expect(unplaced).toHaveLength(2);
  });
});

describe('autoLayout', () => {
  it.each(presetTypes)('%s: semua kamar demo (12, 3 lantai) muat dan valid', (type) => {
    const list = rooms(['101', '102', '103', '104', '201', '202', '203', '204', '301', '302', '303', '304']);
    const { layout, placements, unplaced } = autoLayout(list, type);
    expect(layout.floors).toBe(3);
    expect(unplaced).toHaveLength(0);
    expect(placements).toHaveLength(12);
    expect(validatePlacements(layout, placements)).toEqual([]);
  });

  it('memperkirakan jumlah lantai dari banyak kamar bila nomor tidak berpola', () => {
    const list = rooms(Array.from({ length: 20 }, (_, i) => `K${i + 1}`));
    const { layout, unplaced } = autoLayout(list, 'memanjang');
    expect(layout.floors).toBe(3);
    expect(unplaced).toHaveLength(0);
  });

  it('mendukung 100 kamar', () => {
    const list = rooms(Array.from({ length: 100 }, (_, i) => `${Math.floor(i / 20) + 1}${String((i % 20) + 1).padStart(2, '0')}`));
    const { layout, placements, unplaced } = autoLayout(list, 'halaman_tengah');
    expect(layout.floors).toBe(5);
    expect(unplaced).toHaveLength(0);
    expect(validatePlacements(layout, placements)).toEqual([]);
  });
});

describe('validatePlacements', () => {
  const layout = { floors: 2, grid_cols: 6, grid_rows: 3 };
  const p = (id: number, floor: number, x: number, y: number, sx = 1, sy = 1): RoomPlacement => ({
    id, floor, grid_x: x, grid_y: y, span_x: sx, span_y: sy, door_side: null,
  });

  it('mendeteksi tumpang tindih termasuk span', () => {
    const errors = validatePlacements(layout, [p(1, 1, 0, 0, 2, 2), p(2, 1, 1, 1)], (id) => `K${id}`);
    expect(errors.some((e) => e.includes('tumpang tindih'))).toBe(true);
  });

  it('kamar di lantai berbeda pada sel sama tidak bentrok', () => {
    expect(validatePlacements(layout, [p(1, 1, 0, 0), p(2, 2, 0, 0)])).toEqual([]);
  });

  it('mendeteksi kamar di luar grid dan lantai', () => {
    expect(validatePlacements(layout, [p(1, 1, 5, 0, 2, 1)])[0]).toContain('di luar grid');
    expect(validatePlacements(layout, [p(1, 3, 0, 0)])[0]).toContain('lantai 3');
    expect(validatePlacements(layout, [p(1, 1, 0, 0, 7, 1)])[0]).toContain('ukuran');
  });

  it('placementAt menemukan kamar dari sel mana pun dalam span-nya', () => {
    const list = [p(1, 1, 2, 0, 2, 2)];
    expect(placementAt(list, 1, 3, 1)?.id).toBe(1);
    expect(placementAt(list, 1, 4, 1)).toBeUndefined();
  });
});

describe('editor footprint', () => {
  it('paintCell, copyFloorPattern, resizeFootprint', () => {
    let fp = generateFootprint('memanjang', 2, 4, 2);
    fp = paintCell(fp, 1, 3, 1, 'bath');
    expect(cellAt(fp, 1, 3, 1)).toBe('bath');
    expect(cellAt(fp, 2, 3, 1)).toBe('corridor');
    fp = copyFloorPattern(fp, 1, 3);
    expect(cellAt(fp, 3, 3, 1)).toBe('bath');
    fp = resizeFootprint(fp, 3, 5, 3);
    expect(fp['1']).toHaveLength(15);
    expect(cellAt(fp, 1, 3, 1)).toBe('bath');
    expect(cellAt(fp, 1, 4, 2)).toBe('void');
  });
});
