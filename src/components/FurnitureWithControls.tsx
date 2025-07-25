import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { TransformControls, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useSimplifiedFurnitureDesign } from '../hooks/useSimplifiedFurnitureDesign';

interface Props {
  design: ReturnType<typeof useSimplifiedFurnitureDesign>;
  textureUrl: string;
}

export const FurnitureWithControls: React.FC<Props> = ({ design, textureUrl }) => {
  const controlsRef = useRef<any>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    new THREE.TextureLoader().load(textureUrl, setTexture);
  }, [textureUrl]);

  // Sincroniza o mesh com o estado global quando ele muda
  useEffect(() => {
    if (meshRef.current) {
      const { originalDimensions, position } = design.space;
      meshRef.current.scale.set(originalDimensions.width, originalDimensions.height, originalDimensions.depth);
      meshRef.current.position.set(position.x, position.y, position.z);
    }
  }, [design.space]);

  const handleDragEnd = () => {
    if (meshRef.current) {
      const { scale, position } = meshRef.current;
      const newDimensions = { width: scale.x, height: scale.y, depth: scale.z };
      const newPosition = { x: position.x, y: position.y, z: position.z };
      
      // Chama a função do hook para atualizar o estado global
      design.updateTransform(newDimensions, newPosition);
    }
  };

  return (
    // O modo "scale" permite redimensionar o objeto
    <TransformControls ref={controlsRef} object={meshRef} mode="scale" onMouseUp={handleDragEnd}>
        {/* Usamos um Box simples como base. A escala o transforma no nosso móvel. */}
        <Box ref={meshRef} args={[1, 1, 1]}>
            <meshStandardMaterial map={texture} />
        </Box>
    </TransformControls>
  );
};
