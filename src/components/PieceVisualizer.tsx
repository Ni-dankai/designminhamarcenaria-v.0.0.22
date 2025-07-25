import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTexture, Edges } from '@react-three/drei';
import { FurniturePiece } from '../types/furniture';
import { ThreeEvent } from '@react-three/fiber';

interface PieceVisualizerProps {
  piece: FurniturePiece;
  textureUrl: string;
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  selectionMode: 'piece' | 'space';
}

export const PieceVisualizer: React.FC<PieceVisualizerProps> = ({ 
  piece, 
  textureUrl, 
  onClick, 
  isHovered,
  isSelected,
  selectionMode,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { position, dimensions } = piece;
  const colorMap = useTexture(textureUrl);

  const materials = useMemo(() => {
    const textureScale = 500;
    const createMaterialForFace = (faceWidth: number, faceHeight: number) => {
      const colorMapClone = colorMap.clone();
      const textureAspect = colorMap.image.width / colorMap.image.height;
      let repeatU, repeatV;
      colorMapClone.wrapS = THREE.RepeatWrapping;
      colorMapClone.wrapT = THREE.RepeatWrapping;
      colorMapClone.center.set(0.5, 0.5);

      if (faceWidth > faceHeight) {
        colorMapClone.rotation = Math.PI / 2;
        repeatU = faceHeight / textureScale;
        repeatV = (faceWidth / textureScale) / textureAspect;
      } else {
        colorMapClone.rotation = 0;
        repeatU = faceWidth / textureScale;
        repeatV = (faceHeight / textureScale) / textureAspect;
      }
      colorMapClone.repeat.set(repeatU, repeatV);
      
      return new THREE.MeshStandardMaterial({
        map: colorMapClone,
        color: "#cccccc",
        roughness: 0.9,
        metalness: 0.0,
        envMapIntensity: 0.7,
      });
    };

    const frontBackMat = createMaterialForFace(dimensions.width, dimensions.height);
    const topBottomMat = createMaterialForFace(dimensions.width, dimensions.depth);
    const leftRightMat = createMaterialForFace(dimensions.depth, dimensions.height);

    return [leftRightMat, leftRightMat, topBottomMat, topBottomMat, frontBackMat, frontBackMat];
  }, [colorMap, dimensions]);

  useEffect(() => {
    if (!meshRef.current || !meshRef.current.material) return;
    const currentMaterials = Array.isArray(meshRef.current.material) ? meshRef.current.material : [meshRef.current.material];
    
    currentMaterials.forEach(mat => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.emissive.set(isHovered && !isSelected ? '#fde047' : '#000000');
        mat.emissiveIntensity = isHovered && !isSelected ? 0.4 : 0;
      }
    });
  }, [isHovered, isSelected]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (selectionMode !== 'piece') return;
    event.stopPropagation();
    onClick();
  };

  if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0 || dimensions.depth <= 0) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      position={[position.x / 100, position.y / 100, position.z / 100]}
      onClick={handleClick}
      // ===================================================================
      // CORREÇÃO CRÍTICA: Desativa a interação com a peça quando
      // o modo de seleção de espaço está ativo.
      // ===================================================================
      raycast={selectionMode === 'piece' ? undefined : () => null}
      castShadow
      receiveShadow
      material={materials}
    >
      <boxGeometry args={[dimensions.width / 100, dimensions.height / 100, dimensions.depth / 100]} />
      <Edges
        scale={1}
        threshold={15}
        color={isSelected ? '#f97316' : '#222222'}
        linewidth={isSelected ? 2.5 : 1}
      />
    </mesh>
  );
};
