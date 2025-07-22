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
    return null;
  }

  // ===================================================================
  // CORREÇÃO: A cor e a opacidade agora mudam com base em 'isSelected'
  // ===================================================================
  const color = isSelected ? '#ff6600' : '#3b82f6'; // Laranja vibrante para seleção
  const opacity = isSelected ? 0.35 : 0.15; // Mais opaco quando selecionado

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (onSelect) {
      onSelect(space.id);
    }
  };

  return (
    <group position={[position.x / 100, position.y / 100, position.z / 100]}>
      
      {/* Parte Visual */}
      <Box
        args={[currentDimensions.width / 100, currentDimensions.height / 100, currentDimensions.depth / 100]}
        raycast={() => null} 
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </Box>

      {/* Parte Interativa (invisível e condicional) */}
      {selectionMode === 'space' && (
        <Box
          args={[currentDimensions.width / 100, currentDimensions.height / 100, currentDimensions.depth / 100]}
          onClick={handleClick}
        >
          <meshBasicMaterial visible={false} />
        </Box>
      )}
      
      {/* A etiqueta de informações (Html) foi removida, mas pode ser adicionada aqui se você quiser */}
      
    </group>
  );
};
