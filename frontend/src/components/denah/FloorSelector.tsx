import React from 'react';
import { Layers } from 'lucide-react';
import type { FloorFilter } from './denahUtils';

interface FloorSelectorProps {
  floors: number;
  value: FloorFilter;
  onChange: (value: FloorFilter) => void;
  exploded?: boolean;
  onExplodedChange?: (value: boolean) => void;
}

const btn = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
    active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;

export const FloorSelector: React.FC<FloorSelectorProps> = ({ floors, value, onChange, exploded, onExplodedChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="flex items-center gap-1 text-sm text-gray-600 mr-1">
      <Layers className="w-4 h-4" /> Lantai:
    </span>
    <button type="button" className={btn(value === 'all')} onClick={() => onChange('all')}>
      Semua
    </button>
    {Array.from({ length: floors }, (_, i) => i + 1).map((f) => (
      <button key={f} type="button" className={btn(value === f)} onClick={() => onChange(f)}>
        Lantai {f}
      </button>
    ))}
    {onExplodedChange && floors > 1 && value === 'all' && (
      <label className="flex items-center gap-2 text-sm text-gray-700 ml-2 cursor-pointer">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={!!exploded}
          onChange={(e) => onExplodedChange(e.target.checked)}
        />
        Lantai terpisah
      </label>
    )}
  </div>
);

export default FloorSelector;
