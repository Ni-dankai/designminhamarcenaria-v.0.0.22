import { Box } from '@react-three/drei';
import { FurnitureSpace } from '../types/furniture';

interface SpaceVisualizerProps {
  space: FurnitureSpace;
}

export const SpaceVisualizer = ({ space }: SpaceVisualizerProps) => {
  const { currentDimensions, position } = space;

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Espaço principal (caixa verde) */}
      <Box
        args={[currentDimensions.width / 100, currentDimensions.height / 100, currentDimensions.depth / 100]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#4ade80" 
          transparent 
          opacity={0.3} 
          wireframe={false}
        />
      </Box>
      
      {/* Wireframe do espaço */}
      <Box
        args={[currentDimensions.width / 100, currentDimensions.height / 100, currentDimensions.depth / 100]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#22c55e" 
          wireframe 
          transparent
          opacity={0.8}
        />
      </Box>
    </group>
  );
};
