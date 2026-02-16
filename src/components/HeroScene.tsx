import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import type { Mesh, Group } from 'three';

/* Shared mouse state so all meshes track the same cursor */
const mouse = { x: 0, y: 0 };

function useGlobalMouse() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);
}

function Icosahedron() {
  const meshRef = useRef<Mesh>(null);
  const smoothX = useRef(0);
  const smoothY = useRef(0);
  const autoAngle = useRef(0);
  const { viewport } = useThree();

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    // Smooth auto-rotation (slow background spin)
    autoAngle.current += delta * 0.15;

    // Fast lerp toward mouse target (0.12 = snappy, ~8 frames to reach)
    const targetX = mouse.y * 0.5;
    const targetY = mouse.x * 0.6;
    smoothX.current += (targetX - smoothX.current) * 0.12;
    smoothY.current += (targetY - smoothY.current) * 0.12;

    meshRef.current.rotation.x = autoAngle.current * 0.4 + smoothX.current;
    meshRef.current.rotation.y = autoAngle.current * 0.6 + smoothY.current;
  });

  const scale = Math.min(viewport.width, viewport.height) * 0.28;

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color="#06b6d4"
          emissive="#0e7490"
          emissiveIntensity={0.3}
          wireframe
          distort={0.2}
          speed={2}
          transparent
          opacity={0.35}
        />
      </mesh>
    </Float>
  );
}

function InnerRing() {
  const ringRef = useRef<Mesh>(null);
  const smoothX = useRef(0);
  const smoothY = useRef(0);

  useFrame((_state, delta) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z += delta * 0.15;

    // Ring tilts toward mouse (slightly slower than icosahedron)
    smoothX.current += (mouse.y * 0.3 - smoothX.current) * 0.08;
    smoothY.current += (mouse.x * 0.3 - smoothY.current) * 0.08;
    ringRef.current.rotation.x = smoothX.current;
    ringRef.current.rotation.y = smoothY.current;
  });

  const { viewport } = useThree();
  const scale = Math.min(viewport.width, viewport.height) * 0.18;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={ringRef} scale={scale}>
        <torusGeometry args={[1, 0.02, 16, 64]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
      </mesh>
    </Float>
  );
}

function OrbitDots() {
  const groupRef = useRef<Group>(null);
  const smoothX = useRef(0);
  const smoothY = useRef(0);
  const count = 40;

  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 0.5;
      pts.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ]);
    }
    return pts;
  }, []);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.03;

    // Dots drift toward mouse (slowest layer = parallax depth)
    smoothX.current += (mouse.y * 0.15 - smoothX.current) * 0.05;
    smoothY.current += (mouse.x * 0.15 - smoothY.current) * 0.05;
    groupRef.current.rotation.x = smoothX.current;
  });

  const { viewport } = useThree();
  const scale = Math.min(viewport.width, viewport.height) * 0.22;

  return (
    <group ref={groupRef} scale={scale}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function SceneSetup() {
  useGlobalMouse();
  return null;
}

export default function HeroScene() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <SceneSetup />
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.4} color="#06b6d4" />
        <pointLight position={[-5, -3, 3]} intensity={0.2} color="#8b5cf6" />
        <Icosahedron />
        <InnerRing />
        <OrbitDots />
      </Canvas>
    </div>
  );
}
