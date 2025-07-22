import React, { Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { FurnitureSpace, FurniturePiece } from '../types/furniture';
import { SingleSpaceVisualizer } from './SingleSpaceVisualizer';
import { PieceVisualizer } from './PieceVisualizer';
import { LoadingSpinner } from './LoadingSpinner';

// Componente recursivo para desenhar os espaços disponíveis (folhas da árvore)
const RecursiveSpaceVisualizer = ({ space, selectedSpaceId, onSelectSpace, selectionMode }: { 
  space: FurnitureSpace; 
  selectedSpaceId?: string | null; 
  onSelectSpace?: (spaceId: string) => void;
  selectionMode: 'piece' | 'space';
}) => {
  if (!space.isActive && space.subSpaces?.length) {
    return (
      <>
        {space.subSpaces.map(sub => (
          <RecursiveSpaceVisualizer key={sub.id} space={sub} selectedSpaceId={selectedSpaceId} onSelectSpace={onSelectSpace} selectionMode={selectionMode} />
        ))}
      </>
    );
  }
  if (space.isActive) {
    return <SingleSpaceVisualizer space={space} isSelected={selectedSpaceId === space.id} onSelect={onSelectSpace} selectionMode={selectionMode} />;
  }
  return null;
};


interface Scene3DProps {
  space: FurnitureSpace;
  allPieces: FurniturePiece[];
  textureUrl: string;
  selectedSpaceId?: string | null;
  onSelectSpace?: (spaceId: string) => void;
  onPieceClick?: (piece: FurniturePiece) => void; // Renomeado e tipo atualizado
  hoveredPieceId?: string | null;
  selectedPieceId?: string | null; // Adicionado
  selectionMode?: 'piece' | 'space'; // Nova prop
}

export const Scene3D: React.FC<Scene3DProps> = ({ 
  space, 
  allPieces, 
  textureUrl, 
  selectedSpaceId, 
  onSelectSpace, 
  onPieceClick, // Renomeado
  hoveredPieceId,
  selectedPieceId, // Adicionado
  selectionMode = 'piece' // Define um valor padrão
}) => {
  const gridYPosition = - (space.originalDimensions.height / 100) / 2 - 0.2;
  const [gridColors, setGridColors] = useState({ cell: '#e0e0e0', section: '#3b82f6' });

  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    const cellColor = computedStyle.getPropertyValue('--color-border').trim();
    const sectionColor = computedStyle.getPropertyValue('--color-primary').trim();
    if (cellColor && sectionColor) {
      setGridColors({ cell: cellColor, section: sectionColor });
    }
  }, []);

  return (
    <Suspense fallback={<LoadingSpinner message="Carregando visualização 3D..." />}>
      <Canvas 
        shadows
        camera={{ position: [5, 4, 12], fov: 50 }} 
        style={{ background: 'var(--color-background-gradient)' }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}> 
          {/* =================================================================== */}
          {/* CORREÇÃO: Iluminação ajustada para maior claridade e definição    */}
          {/* =================================================================== */}
          
          {/* Luz ambiente mais forte para clarear a cena como um todo */}
          <ambientLight intensity={0.8} />
          
          {/* Luz principal (sol) mais intensa para destacar a textura */}
          <directionalLight 
              position={[5, 10, 8]} 
              intensity={1.5} 
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
          />
          
          {/* Ambiente para reflexos, mantendo uma intensidade equilibrada */}
          <Environment preset="apartment" /> 
          
          <Grid 
            position={[0, gridYPosition, 0]} 
            args={[25, 25]} 
            cellColor={gridColors.cell} 
            sectionColor={gridColors.section} 
            infiniteGrid 
          />
            
          <RecursiveSpaceVisualizer space={space} selectedSpaceId={selectedSpaceId} onSelectSpace={onSelectSpace} selectionMode={selectionMode} />

          {allPieces.map((piece) => (
            <PieceVisualizer 
              key={piece.id}
              piece={piece} 
              textureUrl={textureUrl}
              onClick={() => onPieceClick && onPieceClick(piece)}
              isHovered={piece.id === hoveredPieceId}
              isSelected={piece.id === selectedPieceId}
              selectionMode={selectionMode} // Passa a prop para o visualizador
            />
          ))}

          <OrbitControls makeDefault maxPolarAngle={Math.PI / 1.8} minDistance={2} maxDistance={50} />
        </Suspense>
      </Canvas>
    </Suspense>
  );
};
