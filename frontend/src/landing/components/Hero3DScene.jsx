import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../hooks';

const HIGHWAYS = [
  [[-3.4, 0.02, 2.6], [-1.4, 0.02, 2.9], [0.6, 0.02, 2.1], [2.8, 0.02, 1.2]],
  [[-3.1, 0.02, 1.0], [-0.8, 0.02, 0.4], [1.4, 0.02, -0.3], [3.0, 0.02, -1.4]],
  [[-2.0, 0.02, 2.8], [-1.7, 0.02, 0.3], [-1.2, 0.02, -1.8], [0.3, 0.02, -2.8]],
  [[1.1, 0.02, 2.5], [1.6, 0.02, 0.5], [1.9, 0.02, -1.5], [0.4, 0.02, -2.6]],
  [[-3.2, 0.02, -0.5], [-1.1, 0.02, -0.9], [1.2, 0.02, -1.2], [2.6, 0.02, -2.2]],
  [[-0.4, 0.02, 2.6], [0.1, 0.02, 0.2], [0.6, 0.02, -1.8]],
];

const ACCIDENTS = [
  [-1.4, 0.06, 2.7, 1],
  [0.7, 0.06, 2.05, 1],
  [2.3, 0.06, 1.35, 0.7],
  [-0.7, 0.06, 0.38, 1],
  [1.5, 0.06, -0.35, 0.8],
  [-1.65, 0.06, 0.2, 1],
  [1.7, 0.06, 0.4, 0.6],
  [-1.05, 0.06, -0.95, 0.7],
  [0.15, 0.06, 0.15, 1],
  [0.55, 0.06, -1.7, 0.9],
];

function lineGeometry(paths) {
  const positions = [];
  paths.forEach((path) => {
    for (let i = 0; i < path.length - 1; i += 1) {
      positions.push(...path[i], ...path[i + 1]);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function gridGeometry() {
  const paths = [];
  for (let i = -2.2; i <= 2.2; i += 0.4) {
    paths.push([[i, 0.015, -2.2], [i, 0.015, 2.2]]);
    paths.push([[-2.2, 0.015, i], [2.2, 0.015, i]]);
  }
  return lineGeometry(paths);
}

function AmbientDust() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(Array.from({ length: 180 }, () => (Math.random() - 0.5) * 10));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#94A3B8" size={0.02} transparent opacity={0.35} />
    </points>
  );
}

function CameraRig({ progressRef, mouse, reduced }) {
  useFrame((state) => {
    const progress = progressRef.current || 0;
    const zoom = THREE.MathUtils.lerp(7.4, 3.15, progress);
    const height = THREE.MathUtils.lerp(5.4, 2.05, progress);
    const x = THREE.MathUtils.lerp(0, 0.55, progress);
    const target = new THREE.Vector3(x, 0, THREE.MathUtils.lerp(0.2, -0.4, progress));
    if (!reduced) {
      target.x += mouse.current.x * 0.35;
      target.y += mouse.current.y * 0.2;
    }
    state.camera.position.lerp(new THREE.Vector3(x + (reduced ? 0 : mouse.current.x * 0.4), height, zoom), 0.06);
    state.camera.lookAt(target);
  });
  return null;
}

function Traffic({ reduced }) {
  const ref = useRef();
  const path = HIGHWAYS[0];
  const count = reduced ? 8 : 28;
  const seeds = useMemo(() => new Array(count).fill(0).map((_, i) => i / count), [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3));
    return geo;
  }, [count]);

  useFrame((state) => {
    if (reduced) return;
    const positions = geometry.attributes.position.array;
    seeds.forEach((seed, index) => {
      const t = (seed + state.clock.elapsedTime * 0.08) % 1;
      const scaled = t * (path.length - 1);
      const a = Math.floor(scaled);
      const b = Math.min(a + 1, path.length - 1);
      const f = scaled - a;
      positions[index * 3] = THREE.MathUtils.lerp(path[a][0], path[b][0], f);
      positions[index * 3 + 1] = 0.08;
      positions[index * 3 + 2] = THREE.MathUtils.lerp(path[a][2], path[b][2], f);
    });
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#22D3EE" size={0.07} transparent opacity={0.9} />
    </points>
  );
}

function Scene({ progressRef, mouse, reduced }) {
  const highwayGeo = useMemo(() => lineGeometry(HIGHWAYS), []);
  const cityGeo = useMemo(() => gridGeometry(), []);
  const radar = useRef();
  const accidents = useRef();

  useFrame((state) => {
    const progress = progressRef.current || 0;
    if (radar.current && !reduced) radar.current.rotation.y = state.clock.elapsedTime * 0.8;
    if (accidents.current) accidents.current.children.forEach((child, index) => {
      const pulse = reduced ? 1 : 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.15;
      child.scale.setScalar(pulse * (0.7 + progress * 0.6));
    });
  });

  return (
    <>
      <color attach="background" args={['#050816']} />
      <fog attach="fog" args={['#050816', 8, 18]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 4, 3]} intensity={18} color="#3B82F6" />
      <pointLight position={[-3, 3, -2]} intensity={10} color="#22D3EE" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[6.4, 64]} />
        <meshStandardMaterial color="#070B1A" metalness={0.2} roughness={0.86} />
      </mesh>
      <gridHelper args={[12, 28, '#16324f', '#0d1a2c']} position={[0, 0.01, 0]} />

      <lineSegments geometry={highwayGeo}>
        <lineBasicMaterial color="#22D3EE" transparent opacity={0.9} />
      </lineSegments>
      <lineSegments geometry={cityGeo}>
        <lineBasicMaterial color="#3B82F6" transparent opacity={0.28} />
      </lineSegments>

      <group ref={accidents}>
        {ACCIDENTS.map(([x, y, z, intensity], index) => (
          <mesh key={index} position={[x, y, z]}>
            <sphereGeometry args={[0.045 + intensity * 0.02, 12, 12]} />
            <meshBasicMaterial color={intensity > 0.8 ? '#EF4444' : '#F59E0B'} />
          </mesh>
        ))}
      </group>

      <mesh position={[1.8, 0.04, -1.6]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#22C55E" />
      </mesh>

      <group ref={radar} position={[0, 0.03, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.7, 1.72, 64]} />
          <meshBasicMaterial color="#22D3EE" transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.7, 64, 0, Math.PI / 7]} />
          <meshBasicMaterial color="#22D3EE" transparent opacity={0.08} />
        </mesh>
      </group>

      {!reduced && <AmbientDust />}

      <Traffic reduced={reduced} />
      <CameraRig progressRef={progressRef} mouse={mouse} reduced={reduced} />
    </>
  );
}

export default function Hero3DScene({ progressRef }) {
  const reduced = usePrefersReducedMotion();
  const mouse = useRef({ x: 0, y: 0 });

  return (
    <div
      className="iris-canvas h-full"
      data-cursor="crosshair"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        mouse.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * -2;
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 5.4, 7.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Scene progressRef={progressRef} mouse={mouse} reduced={reduced} />
      </Canvas>
    </div>
  );
}
