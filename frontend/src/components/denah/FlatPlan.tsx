import React from 'react';
import { DoorOpen, Star, UserRound } from 'lucide-react';
import { cellAt, type KostLayout } from '../../lib/layoutPresets';
import type { LayoutRoom } from '../../services/layoutService';
import { CELL_COLOR, isPlaced, matchesFilter, STATUS_LABEL, visibleFloors, type FloorFilter, type StatusFilter } from './denahUtils';

interface FlatPlanProps {
  layout: KostLayout;
  rooms: LayoutRoom[];
  floorFilter: FloorFilter;
  statusFilter: StatusFilter;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

// Denah datar 2D berbasis grid HTML: fallback bila WebGL tidak ada / prefers-reduced-motion.
export const FlatPlan: React.FC<FlatPlanProps> = ({ layout, rooms, floorFilter, statusFilter, selectedId, onSelect }) => {
  const floors = visibleFloors(layout, floorFilter).slice().reverse(); // lantai atas di atas

  return (
    <div className="space-y-6 overflow-x-auto">
      {floors.map((floor) => {
        const floorRooms = rooms.filter((r) => isPlaced(r) && r.floor === floor);
        return (
          <section key={floor} aria-label={`Lantai ${floor}`}>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Lantai {floor}</h4>
            <div
              className="grid gap-1 bg-white p-2 rounded-lg border border-gray-200"
              style={{
                gridTemplateColumns: `repeat(${layout.grid_cols}, minmax(2.5rem, 1fr))`,
                gridTemplateRows: `repeat(${layout.grid_rows}, 2.75rem)`,
                minWidth: `${layout.grid_cols * 2.75}rem`,
              }}
            >
              {Array.from({ length: layout.grid_rows * layout.grid_cols }, (_, i) => {
                const x = i % layout.grid_cols;
                const y = Math.floor(i / layout.grid_cols);
                const t = cellAt(layout.footprint, floor, x, y);
                return (
                  <div
                    key={`c-${x}-${y}`}
                    className="rounded-sm"
                    style={{
                      gridColumn: x + 1,
                      gridRow: y + 1,
                      background: t === 'void' ? 'transparent' : CELL_COLOR[t],
                      border: t === 'void' ? '1px dashed #e5e7eb' : undefined,
                    }}
                    title={t === 'stairs' ? 'Tangga' : t === 'corridor' ? 'Lorong' : t === 'bath' ? 'Kamar mandi bersama' : undefined}
                  />
                );
              })}
              {floorRooms.map((r) => {
                const dim = !matchesFilter(r, statusFilter);
                const empty = r.status === 'tersedia';
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelect(r.id)}
                    aria-label={`Kamar ${r.nomor_kamar}, ${STATUS_LABEL[r.status]}${r.is_mine ? ', kamar Anda' : ''}`}
                    title={`Kamar ${r.nomor_kamar} · ${STATUS_LABEL[r.status]}`}
                    className={`relative rounded-md text-white text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                      empty ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                    } ${selectedId === r.id ? 'ring-4 ring-blue-400' : ''} ${r.is_mine ? 'outline outline-4 outline-yellow-400' : ''} ${
                      dim ? 'opacity-25' : ''
                    }`}
                    style={{
                      gridColumn: `${(r.grid_x as number) + 1} / span ${r.span_x}`,
                      gridRow: `${(r.grid_y as number) + 1} / span ${r.span_y}`,
                    }}
                  >
                    {empty ? <DoorOpen className="w-3.5 h-3.5" /> : <UserRound className="w-3.5 h-3.5" />}
                    <span>{r.nomor_kamar}</span>
                    {r.is_mine && <Star className="w-3 h-3 absolute top-0.5 right-0.5 text-yellow-200" />}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default FlatPlan;
