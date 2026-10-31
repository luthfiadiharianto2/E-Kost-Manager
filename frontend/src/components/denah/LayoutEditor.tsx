import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, MousePointer2, Paintbrush, Save, Trash2, Wand2 } from 'lucide-react';
import {
  BUILDING_TYPES,
  CELL_TYPES,
  GRID_LIMITS,
  autoLayout,
  cellAt,
  copyFloorPattern,
  doorSideFor,
  generateFootprint,
  normalizeGrid,
  paintCell,
  placementAt,
  resizeFootprint,
  validatePlacements,
  type BuildingType,
  type CellType,
  type DoorSide,
  type KostLayout,
  type RoomPlacement,
} from '../../lib/layoutPresets';
import { layoutService, type KostLayoutData, type LayoutRoom } from '../../services/layoutService';
import { CELL_COLOR, toPlacements } from './denahUtils';

interface LayoutEditorProps {
  kostId: number;
  rooms: LayoutRoom[];
  layout: KostLayout | null;
  onSaved: (data: KostLayoutData) => void;
}

type Tool = 'place' | 'paint';

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-700 mb-2';
const DOOR_LABEL: Record<DoorSide, string> = { n: 'Atas (utara)', e: 'Kanan (timur)', s: 'Bawah (selatan)', w: 'Kiri (barat)' };

const defaultLayout = (rooms: LayoutRoom[]): KostLayout => autoLayout(rooms, 'lorong_tengah').layout;

export const LayoutEditor: React.FC<LayoutEditorProps> = ({ kostId, rooms, layout, onSaved }) => {
  const [draft, setDraft] = useState<KostLayout>(() => layout ?? defaultLayout(rooms));
  const [placements, setPlacements] = useState<RoomPlacement[]>(() => toPlacements(rooms));
  const [floor, setFloor] = useState(1);
  const [tool, setTool] = useState<Tool>('place');
  const [brush, setBrush] = useState<CellType>('corridor');
  const [activeRoom, setActiveRoom] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [gridForm, setGridForm] = useState({ floors: draft.floors, cols: draft.grid_cols, rows: draft.grid_rows });

  // Draft hanya diinisialisasi sekali; halaman me-remount editor (prop key) setelah denah disimpan,
  // jadi refetch realtime tidak menghapus perubahan yang belum disimpan.
  useEffect(() => {
    if (floor > draft.floors) setFloor(draft.floors);
  }, [draft.floors, floor]);

  const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const labelOf = (id: number) => roomById.get(id)?.nomor_kamar ?? `#${id}`;
  const errors = validatePlacements(draft, placements, labelOf);
  const placedIds = new Set(placements.map((p) => p.id));
  const unplaced = rooms.filter((r) => !placedIds.has(r.id));
  const active = placements.find((p) => p.id === activeRoom) ?? null;

  const applyShape = (type: BuildingType, floors: number, cols: number, rows: number) => {
    const grid = type === 'kustom' ? { cols, rows } : normalizeGrid(type, cols, rows);
    const f = Math.min(GRID_LIMITS.maxFloors, Math.max(1, Math.round(floors)));
    const footprint =
      type === 'kustom'
        ? resizeFootprint(draft.footprint, f, grid.cols, grid.rows)
        : generateFootprint(type, f, grid.cols, grid.rows);
    const next: KostLayout = { building_type: type, floors: f, grid_cols: grid.cols, grid_rows: grid.rows, footprint };
    setDraft(next);
    setGridForm({ floors: f, cols: grid.cols, rows: grid.rows });
    // kamar yang tidak lagi muat dilepas dari denah
    setPlacements((prev) =>
      prev.filter((p) => p.floor <= f && p.grid_x + p.span_x <= grid.cols && p.grid_y + p.span_y <= grid.rows)
    );
  };

  const handleAuto = () => {
    if (rooms.length === 0) {
      toast.error('Belum ada kamar. Tambah kamar di menu Fasilitas terlebih dahulu.');
      return;
    }
    const type = draft.building_type === 'kustom' ? 'lorong_tengah' : draft.building_type;
    const result = autoLayout(rooms, type);
    setDraft(result.layout);
    setGridForm({ floors: result.layout.floors, cols: result.layout.grid_cols, rows: result.layout.grid_rows });
    setPlacements(result.placements);
    setFloor(1);
    if (result.unplaced.length) {
      toast.error(`${result.unplaced.length} kamar tidak muat. Perbesar grid atau tambah lantai.`);
    } else {
      toast.success('Denah otomatis dibuat. Periksa lalu klik Simpan Denah.');
    }
  };

  const tryPlace = (id: number, x: number, y: number) => {
    const current = placements.find((p) => p.id === id);
    const spanX = current?.span_x ?? 1;
    const spanY = current?.span_y ?? 1;
    const candidate: RoomPlacement = {
      id,
      floor,
      grid_x: x,
      grid_y: y,
      span_x: spanX,
      span_y: spanY,
      door_side: doorSideFor(draft, floor, x, y, spanX, spanY) ?? current?.door_side ?? null,
    };
    const next = [...placements.filter((p) => p.id !== id), candidate];
    const problems = validatePlacements(draft, [candidate, ...placements.filter((p) => p.id !== id && p.floor === floor)], labelOf);
    if (problems.length) {
      toast.error(problems[0]);
      return;
    }
    setPlacements(next);
  };

  const handleCellClick = (x: number, y: number) => {
    if (tool === 'paint') {
      if (placementAt(placements, floor, x, y) && brush !== 'room') {
        toast.error('Lepas kamar dari sel ini terlebih dahulu.');
        return;
      }
      setDraft((d) => ({ ...d, building_type: 'kustom', footprint: paintCell(d.footprint, floor, x, y, brush) }));
      return;
    }
    const occupant = placementAt(placements, floor, x, y);
    if (occupant) {
      setActiveRoom(occupant.id);
      return;
    }
    if (activeRoom !== null) tryPlace(activeRoom, x, y);
  };

  const updateActive = (patch: Partial<RoomPlacement>) => {
    if (!active) return;
    const candidate = { ...active, ...patch };
    const problems = validatePlacements(
      draft,
      [candidate, ...placements.filter((p) => p.id !== active.id && p.floor === candidate.floor)],
      labelOf
    );
    if (problems.length) {
      toast.error(problems[0]);
      return;
    }
    setPlacements((prev) => prev.map((p) => (p.id === active.id ? candidate : p)));
  };

  const handleSave = async () => {
    if (errors.length) {
      toast.error('Perbaiki kesalahan penempatan terlebih dahulu.');
      return;
    }
    if (layout && !window.confirm('Denah yang sudah ada akan ditimpa. Lanjutkan?')) return;
    try {
      setSaving(true);
      const saved = await layoutService.saveLayout(kostId, draft, placements);
      toast.success('Denah berhasil disimpan');
      onSaved(saved);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan denah');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bentuk bangunan */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Tipe Bangunan</label>
            <select
              className={inputClass}
              value={draft.building_type}
              onChange={(e) => applyShape(e.target.value as BuildingType, gridForm.floors, gridForm.cols, gridForm.rows)}
            >
              {BUILDING_TYPES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label} — {b.hint}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Jumlah Lantai</label>
            <input
              type="number"
              min={1}
              max={GRID_LIMITS.maxFloors}
              className={inputClass}
              value={gridForm.floors}
              onChange={(e) => setGridForm((g) => ({ ...g, floors: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className={labelClass}>Kolom Grid</label>
            <input
              type="number"
              min={GRID_LIMITS.minCols}
              max={GRID_LIMITS.maxCols}
              className={inputClass}
              value={gridForm.cols}
              onChange={(e) => setGridForm((g) => ({ ...g, cols: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className={labelClass}>Baris Grid</label>
            <input
              type="number"
              min={GRID_LIMITS.minRows}
              max={GRID_LIMITS.maxRows}
              className={inputClass}
              value={gridForm.rows}
              onChange={(e) => setGridForm((g) => ({ ...g, rows: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => applyShape(draft.building_type, gridForm.floors, gridForm.cols, gridForm.rows)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Terapkan Ukuran
          </button>
          <button
            type="button"
            onClick={handleAuto}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" /> Buat denah otomatis
          </button>
        </div>
      </div>

      {/* Alat & lantai */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: draft.floors }, (_, i) => i + 1).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFloor(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                floor === f ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lantai {f}
            </button>
          ))}
          {draft.floors > 1 && (
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, footprint: copyFloorPattern(d.footprint, floor, d.floors) }))}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" /> Salin pola ke semua lantai
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTool('place')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              tool === 'place' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MousePointer2 className="w-4 h-4" /> Tempatkan Kamar
          </button>
          <button
            type="button"
            onClick={() => setTool('paint')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              tool === 'paint' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Paintbrush className="w-4 h-4" /> Ubah Sel
          </button>
          {tool === 'paint' && (
            <select
              value={brush}
              onChange={(e) => setBrush(e.target.value as CellType)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CELL_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grid lantai */}
        <div className="lg:col-span-2 overflow-x-auto">
          <div
            className="grid gap-1 bg-white p-2 rounded-lg border border-gray-200"
            style={{
              gridTemplateColumns: `repeat(${draft.grid_cols}, minmax(2.5rem, 1fr))`,
              gridTemplateRows: `repeat(${draft.grid_rows}, 2.75rem)`,
              minWidth: `${draft.grid_cols * 2.75}rem`,
            }}
          >
            {Array.from({ length: draft.grid_rows * draft.grid_cols }, (_, i) => {
              const x = i % draft.grid_cols;
              const y = Math.floor(i / draft.grid_cols);
              const t = cellAt(draft.footprint, floor, x, y);
              return (
                <button
                  key={`e-${x}-${y}`}
                  type="button"
                  onClick={() => handleCellClick(x, y)}
                  aria-label={`Sel ${x + 1},${y + 1} (${CELL_TYPES.find((c) => c.value === t)?.label})`}
                  className="rounded-sm hover:ring-2 hover:ring-blue-300 transition-shadow"
                  style={{
                    gridColumn: x + 1,
                    gridRow: y + 1,
                    background: t === 'void' ? 'transparent' : t === 'room' ? '#ffffff' : CELL_COLOR[t],
                    border: t === 'void' ? '1px dashed #d1d5db' : t === 'room' ? '1px solid #d1d5db' : undefined,
                  }}
                />
              );
            })}
            {placements
              .filter((p) => p.floor === floor)
              .map((p) => {
                const room = roomById.get(p.id);
                if (!room) return null;
                const empty = room.status === 'tersedia';
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveRoom(p.id)}
                    className={`rounded-md text-white text-xs font-semibold flex items-center justify-center ${
                      empty ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                    } ${activeRoom === p.id ? 'ring-4 ring-blue-400' : ''}`}
                    style={{
                      gridColumn: `${p.grid_x + 1} / span ${p.span_x}`,
                      gridRow: `${p.grid_y + 1} / span ${p.span_y}`,
                    }}
                    title={`Kamar ${room.nomor_kamar}`}
                  >
                    {room.nomor_kamar}
                  </button>
                );
              })}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {tool === 'place'
              ? 'Pilih kamar dari daftar (atau klik kamar di grid), lalu klik sel kosong untuk menaruh/memindahkannya.'
              : 'Klik sel untuk mengubah jenisnya. Mengubah sel menjadikan tipe bangunan "Kustom".'}
          </p>
        </div>

        {/* Panel samping */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Kamar belum ditempatkan ({unplaced.length})
            </h4>
            {unplaced.length === 0 ? (
              <p className="text-sm text-gray-500">Semua kamar sudah ditempatkan.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {unplaced.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setTool('place');
                      setActiveRoom(r.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      activeRoom === r.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {r.nomor_kamar}
                  </button>
                ))}
              </div>
            )}
          </div>

          {active && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Kamar {labelOf(active.id)}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Lebar (sel)</label>
                  <select
                    className={inputClass}
                    value={active.span_x}
                    onChange={(e) => updateActive({ span_x: Number(e.target.value) })}
                  >
                    {Array.from({ length: GRID_LIMITS.maxSpan }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Panjang (sel)</label>
                  <select
                    className={inputClass}
                    value={active.span_y}
                    onChange={(e) => updateActive({ span_y: Number(e.target.value) })}
                  >
                    {Array.from({ length: GRID_LIMITS.maxSpan }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Arah pintu</label>
                <select
                  className={inputClass}
                  value={active.door_side ?? ''}
                  onChange={(e) => updateActive({ door_side: (e.target.value || null) as DoorSide | null })}
                >
                  <option value="">Tidak ditentukan</option>
                  {(Object.keys(DOOR_LABEL) as DoorSide[]).map((d) => (
                    <option key={d} value={d}>{DOOR_LABEL[d]}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPlacements((prev) => prev.filter((p) => p.id !== active.id));
                }}
                className="w-full px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Lepas dari denah
              </button>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <ul className="text-sm text-red-800 list-disc pl-5 space-y-1">
                {errors.slice(0, 5).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" /> {saving ? 'Menyimpan...' : 'Simpan Denah'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayoutEditor;
