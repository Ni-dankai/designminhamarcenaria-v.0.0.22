import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureSpace } from '../types/furniture';
import { ThreeEvent } from '@react-three/fiber';

interface SingleSpaceVisualizerProps {
  space: FurnitureSpace;
  isSelected?: boolean;
  onSelect?: (spaceId: string) => void;
  selectionMode: 'piece' | 'space';
}

export const SingleSpaceVisualizer: React.FC<SingleSpaceVisualizerProps> = ({ 
  space, 
  isSelected = false, 
  onSelect, 
  selectionMode 
}) => {
  const { currentDimensions, position = { x: 0, y: 0, z: 0 } } = space;
  
  const hasSpace = currentDimensions.width > 1 && 
                   currentDimensions.height > 1 && 
                   currentDimensions.depth > 1;

  if (!hasSpace) {
    return null; // Retorna null se o espaço for inválido
  }

  const color = isSelected ? '#ff6600' : '#3b82f6';

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (selectionMode !== 'space') return;
    
    event.stopPropagation();
    if (onSelect) {
      onSelect(space.id);
    }
  };
  
  // ===================================================================
  // CORREÇÃO: Removido o <group> e a posição foi aplicada
  // diretamente no <Box> para garantir que o objeto seja clicável.
  // ===================================================================
  return (
    <Box
      position={[position.x / 100, position.y / 100, position.z / 100]}
      args={[currentDimensions.width / 100, currentDimensions.height / 100, currentDimensions.depth / 100]}
      onClick={handleClick}
      raycast={selectionMode === 'space' ? undefined : () => null}
    >
      <meshStandardMaterial
        color={color}
        transparent
        opacity={isSelected ? 0.35 : 0.15}
        depthWrite={false}
      />
    </Box>
  );
};
