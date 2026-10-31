import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, OrbitControls, OrthographicCamera, PerspectiveCamera, useBounds } from '@react-three/drei';
import { BoxGeometry, InstancedMesh, MOUSE, Object3D, TOUCH } from 'three';
import type { CellType, FootprintCell, KostLayout } from '../../lib/layoutPresets';
import type { LayoutRoom } from '../../services/layoutService';
import { RoomBox, WALL_H } from './RoomBox';
import { CELL_COLOR, isPlaced, matchesFilter, visibleFloors, type FloorFilter, type StatusFilter } from './denahUtils';

export interface KostSceneProps {
  layout: KostLayout;
  rooms: LayoutRoom[];
  mode: '2.5d' | '3d';
  floorFilter: FloorFilter;
  exploded: boolean;
  statusFilter: StatusFilter;
  selectedId: number | null;
  onSelect: (id: number) => void;
  resetKey: number;
}

const SLAB_H = 0.08;
const FLOOR_H = SLAB_H + WALL_H + 0.25;
const EXPLODE_GAP = 1.4;
const TILE = new BoxGeometry(1, 1, 1);
const TILE_TYPES: Exclude<CellType, 'void'>[] = ['room', 'corridor', 'stairs', 'bath'];

/** Lantai (slab) per jenis sel memakai instancing: satu draw call per jenis per lantai. */
const FloorTiles: React.FC<{ cells: FootprintCell[]; baseY: number }> = ({ cells, baseY }) => {
  const groups = useMemo(() => {
    const g: Record<string, FootprintCell[]> = {};
    for (const t of TILE_TYPES) g[t] = cells.filter((c) => c.t === t);
    return g;
  }, [cells]);
  const stairs = groups.stairs;

  return (
    <group position={[0, baseY, 0]}>
      {TILE_TYPES.map((t) =>
        groups[t].length ? <TileInstances key={t} cells={groups[t]} color={CELL_COLOR[t]} /> : null
      )}
      {stairs.length > 0 && <StairSteps cells={stairs} />}
    </group>
  );
};

const TileInstances: React.FC<{ cells: FootprintCell[]; color: string }> = ({ cells, color }) => {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new Object3D();
    cells.forEach((c, i) => {
      dummy.position.set(c.x + 0.5, SLAB_H / 2, c.y + 0.5);
      dummy.scale.set(0.98, SLAB_H, 0.98);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [cells]);
  return (
    <instancedMesh ref={ref} args={[TILE, undefined, cells.length]} raycast={() => null}>
      <meshStandardMaterial color={color} />
    </instancedMesh>
  );
};

const StairSteps: React.FC<{ cells: FootprintCell[] }> = ({ cells }) => {
  const ref = useRef<InstancedMesh>(null);
  const STEPS = 4;
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new Object3D();
    cells.forEach((c, i) => {
      for (let s = 0; s < STEPS; s++) {
        const h = ((s + 1) / STEPS) * (WALL_H * 0.8);
        dummy.position.set(c.x + 0.5, SLAB_H + h / 2, c.y + 0.125 + s * 0.25);
        dummy.scale.set(0.8, h, 0.24);
        dummy.updateMatrix();
        mesh.setMatrixAt(i * STEPS + s, dummy.matrix);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [cells]);
  return (
    <instancedMesh ref={ref} args={[TILE, undefined, cells.length * STEPS]} raycast={() => null}>
      <meshStandardMaterial color="#6b7280" />
    </instancedMesh>
  );
};

/** Paskan kamera ke bangunan saat pertama kali dan saat tombol "Reset tampilan" ditekan. */
const FitOnReset: React.FC<{ resetKey: number; deps: string }> = ({ resetKey, deps }) => {
  const bounds = useBounds();
  useEffect(() => {
    bounds.refresh().clip().fit();
  }, [resetKey, deps, bounds]);
  return null;
};

const Building: React.FC<Omit<KostSceneProps, 'mode' | 'resetKey'> & { hovered: number | null; setHovered: (id: number | null) => void }> = ({
  layout,
  rooms,
  floorFilter,
  exploded,
  statusFilter,
  selectedId,
  onSelect,
  hovered,
  setHovered,
}) => {
  const floors = visibleFloors(layout, floorFilter);
  const stacked = floorFilter === 'all' && !exploded && layout.floors > 1;
  const topFloor = floors[floors.length - 1];
  const placed = useMemo(() => rooms.filter(isPlaced), [rooms]);

  return (
    <group position={[-layout.grid_cols / 2, 0, -layout.grid_rows / 2]}>
      {floors.map((floor, idx) => {
        const baseY = idx * (FLOOR_H + (exploded && floorFilter === 'all' ? EXPLODE_GAP : 0));
        const cells = layout.footprint[String(floor)] || [];
        return (
          <group key={floor}>
            <FloorTiles cells={cells} baseY={baseY} />
            {placed
              .filter((r) => r.floor === floor)
              .map((r) => (
                <RoomBox
                  key={r.id}
                  room={r}
                  baseY={baseY + SLAB_H}
                  dimmed={!matchesFilter(r, statusFilter)}
                  selected={selectedId === r.id}
                  hovered={hovered === r.id}
                  showLabel={!stacked || floor === topFloor || r.is_mine}
                  onSelect={onSelect}
                  onHover={setHovered}
                />
              ))}
          </group>
        );
      })}
    </group>
  );
};

const KostScene: React.FC<KostSceneProps> = ({ mode, resetKey, ...props }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const span = Math.max(props.layout.grid_cols, props.layout.grid_rows, 6);
  const fitDeps = `${props.floorFilter}|${props.exploded}|${props.layout.grid_cols}x${props.layout.grid_rows}x${props.layout.floors}`;

  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  return (
    <Canvas
      key={mode}
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: false }}
      onPointerMissed={() => setHovered(null)}
      aria-label="Denah kost 3D"
    >
      <color attach="background" args={['#f9fafb']} />
      {mode === '2.5d' ? (
        <OrthographicCamera makeDefault position={[span * 2, span * 2, span * 2]} zoom={30} near={-1000} far={1000} />
      ) : (
        <PerspectiveCamera makeDefault position={[span * 0.9, span * 1.1, span * 1.4]} fov={45} near={0.1} far={1000} />
      )}
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 16, 10]} intensity={0.9} />
      <hemisphereLight args={['#ffffff', '#d1d5db', 0.35]} />

      {/* kamera perspektif butuh margin lebih besar: jarak fit drei tidak memperhitungkan kemiringan kamera */}
      <Bounds fit clip observe margin={mode === '3d' ? 1.7 : 1.15} maxDuration={0.6}>
        <Building {...props} hovered={hovered} setHovered={setHovered} />
        <FitOnReset resetKey={resetKey} deps={fitDeps} />
      </Bounds>

      <OrbitControls
        makeDefault
        enableRotate={mode === '3d'}
        enableDamping={false}
        screenSpacePanning
        maxPolarAngle={Math.PI / 2.05}
        mouseButtons={mode === '3d' ? { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN } : { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
        touches={mode === '3d' ? { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN } : { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
      />
    </Canvas>
  );
};

export default KostScene;
