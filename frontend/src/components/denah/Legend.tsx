import React from 'react';
import { DoorOpen, UserRound, Star } from 'lucide-react';

interface LegendProps {
  showMine?: boolean;
}

// Legenda berikon + teks agar tidak hanya bergantung pada warna (aman untuk buta warna)
export const Legend: React.FC<LegendProps> = ({ showMine = false }) => (
  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700" aria-label="Legenda status kamar">
    <span className="flex items-center gap-2">
      <span className="w-4 h-4 rounded bg-green-500 inline-block" aria-hidden="true" />
      <DoorOpen className="w-4 h-4 text-green-600" aria-hidden="true" />
      Kosong
    </span>
    <span className="flex items-center gap-2">
      <span className="w-4 h-4 rounded bg-red-500 inline-block" aria-hidden="true" />
      <UserRound className="w-4 h-4 text-red-600" aria-hidden="true" />
      Terisi
    </span>
    {showMine && (
      <span className="flex items-center gap-2">
        <span className="w-4 h-4 rounded border-2 border-yellow-400 bg-yellow-100 inline-block" aria-hidden="true" />
        <Star className="w-4 h-4 text-yellow-500" aria-hidden="true" />
        Kamar Anda
      </span>
    )}
    <span className="flex items-center gap-2 text-gray-500">
      <span className="w-4 h-4 rounded bg-gray-200 inline-block" aria-hidden="true" />
      Lorong
    </span>
    <span className="flex items-center gap-2 text-gray-500">
      <span className="w-4 h-4 rounded bg-gray-400 inline-block" aria-hidden="true" />
      Tangga
    </span>
  </div>
);

export default Legend;
