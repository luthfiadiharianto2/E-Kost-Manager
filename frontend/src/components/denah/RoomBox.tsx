import React, { useMemo } from 'react';
import { BoxGeometry } from 'three';
import { Edges, Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { LayoutRoom } from '../../services/layoutService';
import { MINE_COLOR, STATUS_COLOR, STATUS_LABEL } from './denahUtils';

// Satu geometri kubus satuan dipakai bersama semua kamar (diskalakan per kamar)
const UNIT_BOX = new BoxGeometry(1, 1, 1);

export const WALL_H = 0.7;
const INSET = 0.08;

interface RoomBoxProps {
  room: LayoutRoom & { grid_x: number; grid_y: number };
  baseY: number;
  dimmed: boolean;
  selected: boolean;
  hovered: boolean;
  showLabel: boolean;
  onSelect: (id: number) => void;
  onHover: (id: number | null) => void;
}

const doorOffset = (side: LayoutRoom['door_side'], w: number, d: number): [number, number, number, number] | null => {
  // [x, z, lebar-x, lebar-z]
  switch (side) {
    case 's': return [0, d / 2, 0.35, 0.04];
    case 'n': return [0, -d / 2, 0.35, 0.04];
    case 'e': return [w / 2, 0, 0.04, 0.35];
    case 'w': return [-w / 2, 0, 0.04, 0.35];
    default: return null;
  }
};

export const RoomBox: React.FC<RoomBoxProps> = React.memo(
  ({ room, baseY, dimmed, selected, hovered, showLabel, onSelect, onHover }) => {
    const w = room.span_x - INSET;
    const d = room.span_y - INSET;
    const h = WALL_H + (selected ? 0.15 : 0);
    const cx = room.grid_x + room.span_x / 2;
    const cz = room.grid_y + room.span_y / 2;
    const color = STATUS_COLOR[room.status];
    const door = useMemo(() => doorOffset(room.door_side, w, d), [room.door_side, w, d]);

    const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();

    return (
      <group position={[cx, baseY, cz]}>
        {room.is_mine && (
          <mesh position={[0, 0.01, 0]} scale={[room.span_x, 0.02, room.span_y]} geometry={UNIT_BOX}>
            <meshBasicMaterial color={MINE_COLOR} />
          </mesh>
        )}
        <mesh
          geometry={UNIT_BOX}
          position={[0, h / 2, 0]}
          scale={[w, h, d]}
          onClick={(e) => {
            stop(e);
            onSelect(room.id);
          }}
          onPointerOver={(e) => {
            stop(e);
            onHover(room.id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            onHover(null);
            document.body.style.cursor = '';
          }}
        >
          <meshStandardMaterial
            color={color}
            emissive={selected || hovered ? color : '#000000'}
            emissiveIntensity={selected ? 0.45 : hovered ? 0.25 : 0}
            transparent
            opacity={dimmed ? 0.18 : 0.92}
            depthWrite={!dimmed}
          />
          <Edges color={room.is_mine ? MINE_COLOR : selected ? '#1d4ed8' : '#ffffff'} threshold={15} />
        </mesh>
        {door && !dimmed && (
          <mesh geometry={UNIT_BOX} position={[door[0], 0.25, door[1]]} scale={[door[2], 0.5, door[3]]}>
            <meshStandardMaterial color="#374151" />
          </mesh>
        )}
        {showLabel && (
          <Html center position={[0, h + 0.25, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div
              className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold shadow ${
                room.is_mine ? 'bg-yellow-400 text-navy-900' : 'bg-white/90 text-gray-900'
              } ${dimmed ? 'opacity-40' : ''}`}
            >
              {room.nomor_kamar}
              {room.is_mine ? ' · Kamar Anda' : ''}
            </div>
          </Html>
        )}
        {hovered && (
          <Html center position={[0, h + 0.9, 0]} zIndexRange={[30, 20]} style={{ pointerEvents: 'none' }}>
            <div className="whitespace-nowrap rounded-lg bg-navy-900 text-white text-xs px-2.5 py-1.5 shadow-lg">
              Kamar {room.nomor_kamar} · {STATUS_LABEL[room.status]}
            </div>
          </Html>
        )}
      </group>
    );
  }
);
RoomBox.displayName = 'RoomBox';

export default RoomBox;
