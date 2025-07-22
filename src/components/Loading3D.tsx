import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const SpinningBox = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#2563eb" />
    </mesh>
  );
};

export const Loading3D = () => {
  return (
    <group>
      <SpinningBox />
      <Html center>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          color: '#1f2937',
          fontWeight: '600',
          fontSize: '14px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          Carregando visualização 3D...
        </div>
      </Html>
    </group>
  );
};
